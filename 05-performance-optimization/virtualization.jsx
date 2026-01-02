/**
 * TOPIC: VIRTUALIZATION
 * DESCRIPTION:
 * Virtualization renders only visible items in long lists, dramatically
 * improving performance. Libraries like react-window and react-virtualized
 * implement this pattern.
 */

import { useState, useRef, useCallback } from 'react';
import { FixedSizeList, VariableSizeList, FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// -------------------------------------------------------------------------------------------
// 1. PROBLEM: RENDERING LONG LISTS
// -------------------------------------------------------------------------------------------

/**
 * Rendering thousands of items causes:
 * - Slow initial render
 * - High memory usage
 * - Sluggish scrolling
 * - Poor user experience
 */

// BAD: Renders all 10,000 items
function BadList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------------------------
// 2. REACT-WINDOW: FIXED SIZE LIST
// -------------------------------------------------------------------------------------------

/**
 * npm install react-window
 * Use when all items have the same height.
 */

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="list-item">
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      width={300}
      itemCount={items.length}
      itemSize={35} // Fixed row height
    >
      {Row}
    </FixedSizeList>
  );
}

// -------------------------------------------------------------------------------------------
// 3. VARIABLE SIZE LIST
// -------------------------------------------------------------------------------------------

/**
 * Use when items have different heights.
 */

function VariableList({ items }) {
  const listRef = useRef(null);

  // Return height for each item
  const getItemSize = (index) => {
    return items[index].expanded ? 100 : 35;
  };

  const Row = ({ index, style }) => (
    <div style={style} className="list-item">
      <h4>{items[index].title}</h4>
      {items[index].expanded && <p>{items[index].description}</p>}
    </div>
  );

  // Reset cache when item sizes change
  const resetAfterIndex = (index) => {
    listRef.current?.resetAfterIndex(index);
  };

  return (
    <VariableSizeList
      ref={listRef}
      height={400}
      width={300}
      itemCount={items.length}
      itemSize={getItemSize}
    >
      {Row}
    </VariableSizeList>
  );
}

// -------------------------------------------------------------------------------------------
// 4. AUTO-SIZING CONTAINER
// -------------------------------------------------------------------------------------------

/**
 * Make list fill available space.
 */

function ResponsiveList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={35}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// 5. GRID VIRTUALIZATION
// -------------------------------------------------------------------------------------------

function VirtualizedGrid({ items, columns }) {
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex;
    if (index >= items.length) return null;

    return (
      <div style={style} className="grid-cell">
        {items[index].name}
      </div>
    );
  };

  return (
    <FixedSizeGrid
      columnCount={columns}
      columnWidth={150}
      height={400}
      rowCount={Math.ceil(items.length / columns)}
      rowHeight={100}
      width={600}
    >
      {Cell}
    </FixedSizeGrid>
  );
}

// -------------------------------------------------------------------------------------------
// 6. INFINITE SCROLL
// -------------------------------------------------------------------------------------------

function InfiniteList({ loadMore, hasMore, items }) {
  const listRef = useRef(null);

  const handleScroll = useCallback(({ scrollOffset, scrollHeight }) => {
    const threshold = scrollHeight - 200;
    if (scrollOffset > threshold && hasMore) {
      loadMore();
    }
  }, [loadMore, hasMore]);

  const Row = ({ index, style }) => {
    if (index >= items.length) {
      return <div style={style}>Loading...</div>;
    }
    return <div style={style}>{items[index].name}</div>;
  };

  return (
    <FixedSizeList
      ref={listRef}
      height={400}
      width={300}
      itemCount={hasMore ? items.length + 1 : items.length}
      itemSize={35}
      onScroll={handleScroll}
    >
      {Row}
    </FixedSizeList>
  );
}

// -------------------------------------------------------------------------------------------
// 7. MEMOIZATION WITH VIRTUALIZATION
// -------------------------------------------------------------------------------------------

import { memo, areEqual } from 'react-window';

const MemoizedRow = memo(({ data, index, style }) => {
  const item = data[index];
  return (
    <div style={style}>
      <span>{item.name}</span>
      <span>{item.status}</span>
    </div>
  );
}, areEqual);

function OptimizedList({ items }) {
  return (
    <FixedSizeList
      height={400}
      width={300}
      itemCount={items.length}
      itemSize={35}
      itemData={items}
    >
      {MemoizedRow}
    </FixedSizeList>
  );
}

// -------------------------------------------------------------------------------------------
// 8. SIMPLE DIY VIRTUALIZATION
// -------------------------------------------------------------------------------------------

/**
 * Basic implementation without library.
 */

function SimpleVirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------
// SUMMARY & BEST PRACTICES
// -------------------------------------------------------------------------------------------

/**
 * KEY POINTS:
 * 1. Only render visible items
 * 2. Use react-window for simplicity
 * 3. FixedSizeList for uniform heights
 * 4. VariableSizeList for dynamic heights
 *
 * BEST PRACTICES:
 * - Use virtualization for 100+ items
 * - Memoize row components
 * - Handle dynamic sizes properly
 * - Consider infinite scroll for large datasets
 *
 * LIBRARIES:
 * - react-window (lightweight, recommended)
 * - react-virtualized (feature-rich)
 * - @tanstack/react-virtual (headless)
 */
