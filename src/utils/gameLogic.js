export const initializeGame = (duration, rows = 4, cols = 4) => {
    const gridSize = rows * cols;
    const segmentDuration = duration / gridSize;
    const segments = [];

    for (let i = 0; i < gridSize; i++) {
        segments.push({
            id: `seg-${i}`,
            startTime: i * segmentDuration,
            endTime: (i + 1) * segmentDuration,
            originalIndex: i,
            isMerged: false,
            mergedIds: [`seg-${i}`], // Track which original segments are in this block
        });
    }

    // Shuffle segments
    return shuffleArray(segments);
};

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const checkMerge = (draggedId, targetId, segments) => {
    const draggedIndex = segments.findIndex((s) => s && s.id === draggedId);
    const targetIndex = segments.findIndex((s) => s && s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return null;

    const draggedSegment = segments[draggedIndex];
    const targetSegment = segments[targetIndex];

    // Check if they are sequential
    const EPSILON = 0.05; // 50ms tolerance

    const isDraggedBeforeTarget = Math.abs(draggedSegment.endTime - targetSegment.startTime) < EPSILON;
    const isTargetBeforeDragged = Math.abs(targetSegment.endTime - draggedSegment.startTime) < EPSILON;

    if (isDraggedBeforeTarget || isTargetBeforeDragged) {
        const newSegment = mergeSegments(
            isDraggedBeforeTarget ? draggedSegment : targetSegment,
            isDraggedBeforeTarget ? targetSegment : draggedSegment
        );

        const newSegments = [...segments];
        newSegments[draggedIndex] = null; // Leave empty slot
        newSegments[targetIndex] = newSegment; // Update target with merged segment

        return newSegments;
    }

    return null;
};

const mergeSegments = (first, second) => {
    return {
        id: `merged-${first.id}-${second.id}`,
        startTime: first.startTime,
        endTime: second.endTime,
        originalIndex: first.originalIndex,
        isMerged: true,
        mergedIds: [...first.mergedIds, ...second.mergedIds],
    };
};

export const getActiveSegmentCount = (segments) => {
    return segments.filter(s => s !== null).length;
};

export const shouldCompact = (segments, currentGridSize) => {
    const count = getActiveSegmentCount(segments);
    const sqrt = Math.sqrt(count);
    // Compact if perfect square AND smaller than current grid
    return Number.isInteger(sqrt) && count < currentGridSize;
};

export const compactGrid = (segments) => {
    const activeSegments = segments.filter(s => s !== null);
    return {
        segments: activeSegments,
        rows: Math.sqrt(activeSegments.length),
        cols: Math.sqrt(activeSegments.length)
    };
};

export const isGameComplete = (segments, totalDuration) => {
    const active = segments.filter(s => s !== null);
    if (active.length !== 1) return false;
    const seg = active[0];
    return Math.abs(seg.startTime - 0) < 0.1 && Math.abs(seg.endTime - totalDuration) < 0.1;
};
