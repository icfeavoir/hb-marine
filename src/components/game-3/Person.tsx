import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { Identifier, XYCoord } from "dnd-core";

// draggable type
type DragItem = {
  index: number;
  id: string;
};

type Props = {
  // person id
  id: string;
  img: string;
  // current person index
  index: number;
  // callback fn when moved
  movePerson: (fromIndex: number, toIndex: number) => void;
};

/**
 * A draggable person
 */
export const Person = (props: Props) => {
  const { id, img, index, movePerson } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: "Person",
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;

      const fromIndex = item.index;
      const toIndex = index;

      // Don't replace items with themselves
      if (fromIndex === toIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get horizontal middle
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the left
      const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (fromIndex < toIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      // Dragging upwards
      if (fromIndex > toIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      // Time to actually perform the action
      movePerson(fromIndex, toIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = toIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "Person",
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="image-item-container"
    >
      <img className="image-item" src={img} />
    </div>
  );
};
