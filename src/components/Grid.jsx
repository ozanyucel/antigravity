import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import Cell from './Cell';
import { initializeGame, checkMerge, isGameComplete, shouldCompact, compactGrid, getActiveSegmentCount } from '../utils/gameLogic';

const Grid = ({ videoSrc, rows: initialRows, cols: initialCols }) => {
    const [segments, setSegments] = useState([]);
    const [gridDimensions, setGridDimensions] = useState({ rows: initialRows, cols: initialCols });
    const [videoDuration, setVideoDuration] = useState(0);
    const [aspectRatio, setAspectRatio] = useState(16 / 9);
    const [activeId, setActiveId] = useState(null);
    const [gameWon, setGameWon] = useState(false);
    const videoRef = useRef(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;

            setVideoDuration(duration);
            setAspectRatio(width / height);
            setSegments(initializeGame(duration, initialRows, initialCols));
            setGridDimensions({ rows: initialRows, cols: initialCols });
            setGameWon(false);
        }
    };

    // Reset game when video or grid size changes
    useEffect(() => {
        if (videoRef.current) {
            // Force reload metadata if video changes
            videoRef.current.load();
        }
    }, [videoSrc, initialRows, initialCols]);


    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        if (active.id !== over.id) {
            const newSegments = checkMerge(active.id, over.id, segments);
            if (newSegments) {
                // Check for compaction
                const currentSize = gridDimensions.rows * gridDimensions.cols;
                if (shouldCompact(newSegments, currentSize)) {
                    const compacted = compactGrid(newSegments);
                    setSegments(compacted.segments);
                    setGridDimensions({ rows: compacted.rows, cols: compacted.cols });
                } else {
                    setSegments(newSegments);
                }

                if (isGameComplete(newSegments, videoDuration)) {
                    setGameWon(true);
                }
            }
        }
    };

    const activeSegment = segments.find(s => s && s.id === activeId);

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4 font-sans overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <h1 className="text-4xl font-extrabold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg z-10 shrink-0">
                Video Puzzle
            </h1>

            {/* Hidden video to get duration */}
            <video
                ref={videoRef}
                src={videoSrc}
                className="hidden"
                onLoadedMetadata={handleLoadedMetadata}
            />

            {gameWon ? (
                <div
                    className="w-auto h-auto max-w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-500/50 animate-fade-in z-10"
                    style={{ aspectRatio: aspectRatio }}
                >
                    <video
                        src={videoSrc}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        controls
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h2 className="text-6xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] animate-bounce">
                            You Won!
                        </h2>
                    </div>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div
                        className="grid gap-2 w-auto h-auto max-w-full max-h-[85vh] bg-white/10 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-white/20 z-10 transition-all duration-500 ease-in-out"
                        style={{
                            aspectRatio: aspectRatio,
                            gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${gridDimensions.rows}, minmax(0, 1fr))`
                        }}
                    >
                        {segments.map((segment, index) => {
                            if (!segment) {
                                return <div key={`empty-${index}`} className="w-full h-full rounded-lg bg-white/5 border border-white/5"></div>;
                            }

                            return (
                                <div key={segment.id} className="w-full h-full transition-all duration-300">
                                    <Cell
                                        segment={segment}
                                        videoSrc={videoSrc}
                                        isCompleted={false}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                        {activeId && activeSegment ? (
                            <div className="w-48 h-28 opacity-90 shadow-2xl transform scale-105 rotate-2">
                                <Cell segment={activeSegment} videoSrc={videoSrc} isCompleted={false} isOverlay />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            <div className="mt-8 text-gray-300 text-lg font-light z-10 bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
                Drag snapshots to merge sequential clips. Reconstruct the video!
            </div>
        </div>
    );
};

export default Grid;
