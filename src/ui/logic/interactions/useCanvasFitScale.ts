import { useLayoutEffect, useState, type RefObject } from "react";

export function useCanvasFitScale(
  container: RefObject<HTMLElement | null>,
  canvasWidth: number,
  canvasHeight: number,
): number {
  const [scale, setScale] = useState(0.1);

  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;

    const update = () => {
      const style = getComputedStyle(element);
      const horizontalPadding =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const verticalPadding =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availableWidth = Math.max(
        1,
        element.clientWidth - horizontalPadding,
      );
      const availableHeight = Math.max(
        1,
        element.clientHeight - verticalPadding,
      );
      setScale(
        Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight),
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [container, canvasWidth, canvasHeight]);

  return scale;
}
