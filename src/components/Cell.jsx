import React, { useRef, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const Cell = ({ segment, videoSrc, isCompleted, isOverlay }) => {
    const videoRef = useRef(null);
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
        id: segment.id,
        data: segment,
        disabled: isCompleted,
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: segment.id,
        data: segment,
        disabled: isCompleted,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (segment.isMerged) {
                if (video.currentTime >= segment.endTime) {
                    video.currentTime = segment.startTime;
                    video.play().catch(() => { });
                }
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [segment]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Initial setup
        video.currentTime = segment.startTime;

        if (segment.isMerged) {
            video.play().catch(() => {
                // Autoplay might be blocked
                console.log("Autoplay blocked");
            });
        } else {
            video.pause();
        }
    }, [segment, videoSrc]);

    return (
        <div
            ref={setDropRef}
            className={`relative w-full h-full overflow-hidden rounded-lg
        ${isOver ? 'ring-4 ring-green-400 scale-105 z-20' : 'ring-1 ring-white/20'}
        ${isDragging ? 'opacity-30 grayscale' : 'opacity-100'}
        ${isOverlay ? 'ring-4 ring-blue-500 shadow-2xl scale-105' : 'shadow-lg'}
        transition-all duration-200 bg-black group`}
        >
            <div
                ref={setDragRef}
                {...listeners}
                {...attributes}
                style={style}
                className="w-full h-full cursor-grab active:cursor-grabbing"
            >
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-cover pointer-events-none"
                    muted
                    playsInline
                />

                {/* Overlay info */}
                <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-br-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {segment.isMerged ? 'Playing Sequence' : 'Snapshot'}
                </div>

                {/* Play icon for merged cells */}
                {segment.isMerged && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cell;
