import type { TypeArray } from '@swnb/power-types';
import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useCacheFn } from '../callback/cache';

export type Position = TypeArray<number, 2>;

export function useSelectedPointermove({
  onSingleTouchmove: _onSingleTouchmove,
  onMultiTouchmove: _onMultiTouchmove = () => {},
  singleMultiMutex = true,
  stopPropagation = false,
}: {
  onSingleTouchmove: (pointer: TypeArray<Position, 2>) => void;
  onMultiTouchmove?: (
    pointer1: TypeArray<Position, 2>,
    pointer2: TypeArray<Position, 2>
  ) => void;
  singleMultiMutex?: boolean;
  stopPropagation?: boolean;
}) {
  const onSingleTouchmoveCache = useCacheFn(_onSingleTouchmove);

  const onMultiTouchmoveCache = useCacheFn(_onMultiTouchmove);

  const isPointerDown = useRef(false);

  const onPointerDown = useCallback(
    (ev: PointerEvent) => {
      if (stopPropagation) {
        ev.stopPropagation();
      }
      isPointerDown.current = true;
    },
    [stopPropagation]
  );

  const previousSinglePositionRef = useRef<[number, number] | null>(null);

  const previousMultiPositionRef = useRef<[Position, Position] | null>(null);

  const onPointerLeave = useCallback(() => {
    isPointerDown.current = false;
    previousMultiPositionRef.current = null;
    previousSinglePositionRef.current = null;
  }, []);

  useEffect(() => {
    const keys = ['pointerup', 'pointerleave', 'pointercancel'] as const;
    keys.forEach((key) => {
      document.body.addEventListener(key, onPointerLeave);
    });

    return () => {
      keys.forEach((key) => {
        document.body.removeEventListener(key, onPointerLeave);
      });
    };
  }, [onPointerLeave]);

  useEffect(() => {
    const callback = (ev: TouchEvent) => {
      if (!isPointerDown.current) return;

      const { length: touchLength } = ev.touches;

      if (touchLength == 1) {
        // single touch
        const { clientX: x, clientY: y } = ev.touches[0];
        const previousPos = previousSinglePositionRef.current;
        if (previousPos) {
          onSingleTouchmoveCache([[...previousPos], [x, y]]);
          previousPos[0] = x;
          previousPos[1] = y;
        } else {
          previousSinglePositionRef.current = [x, y];
        }
      } else {
        // multi touch
        const { clientX: x1, clientY: y1 } = ev.touches[0];
        const { clientX: x2, clientY: y2 } = ev.touches[1];
        const previousMultiPos = previousMultiPositionRef.current;

        const pointer1: Position = [x1, y1];
        const pointer2: Position = [x2, y2];

        if (!singleMultiMutex) {
          // 可以同时触发单个指的事件
          const previousPos = previousSinglePositionRef.current;
          if (previousPos) {
            onSingleTouchmoveCache([[...previousPos], [...pointer1]]);
            previousPos[0] = x1;
            previousPos[1] = y1;
          } else {
            previousSinglePositionRef.current = [x1, y1];
          }
        }

        if (previousMultiPos) {
          onMultiTouchmoveCache(
            [previousMultiPos[0], pointer1],
            [previousMultiPos[1], pointer2]
          );
          previousMultiPositionRef.current = [pointer1, pointer2];
        } else {
          previousMultiPositionRef.current = [
            [x1, y1],
            [x2, y2],
          ];
        }
      }
    };
    document.body.addEventListener('touchmove', callback);
    return () => {
      document.body.removeEventListener('touchmove', callback);
    };
  }, [onMultiTouchmoveCache, onSingleTouchmoveCache, singleMultiMutex]);

  useEffect(() => {
    const callback = (ev: MouseEvent) => {
      if (!isPointerDown.current) return;
      const { clientX: x, clientY: y } = ev;
      const previousPos = previousSinglePositionRef.current;
      if (previousPos) {
        onSingleTouchmoveCache([[...previousPos], [x, y]]);
        previousPos[0] = x;
        previousPos[1] = y;
      } else {
        previousSinglePositionRef.current = [x, y];
      }
    };
    document.body.addEventListener('mousemove', callback);
    return () => {
      document.body.removeEventListener('mousemove', callback);
    };
  }, [onSingleTouchmoveCache]);

  return useMemo(
    () => ({
      onPointerCancelCapture: onPointerLeave,
      onPointerDown,
    }),
    [onPointerDown, onPointerLeave]
  );
}

export function useHover(ref: React.RefObject<HTMLElement>) {
  const [isHover, setIsHover] = useState(false);
  useEffect(() => {
    const dom = ref.current;
    if (!dom) {
      return;
    }
    const onMouseEnter = () => {
      setIsHover(true);
    };
    const onMouseLeave = () => {
      setIsHover(false);
    };

    dom.addEventListener('mouseenter', onMouseEnter);
    dom.addEventListener('mouseleave', onMouseLeave);
    return () => {
      dom.removeEventListener('mouseenter', onMouseEnter);
      dom.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);
  return isHover;
}
