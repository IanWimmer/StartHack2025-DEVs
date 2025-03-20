import { Card, CardHeader, CardBody } from "@heroui/react";
import { cn } from "@/lib/utils";
import React, { MouseEvent, useState } from "react";

const CardContainer = ({
  id,
  title,
  content,
  onSelect,
  onDeselect,

  rowSpan = "1",
  colSpan = "1",
  className,
}: {
  id: string;
  title?: string;
  content?: string | React.ReactElement;
  onSelect?: (cardID: string) => void;
  onDeselect?: (cardID: string) => void;

  rowSpan?: string,
  colSpan?: string,
  className?: string;
}) => {
  const [isSelected, setIsSelected] = useState(false);

  // Toggles selection state
  const toggleSelection = () => {
    if (!isSelected && onSelect) {
      onSelect(id);
    } else if (isSelected && onDeselect) {
      onDeselect(id);
    }
    setIsSelected(!isSelected);
  };

  // Handle shift-click anywhere on the card
  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      toggleSelection();
    }
  };

  return (
    <div
      className={cn("cardContainer h-full max-h-full", "row-span-" + rowSpan, "col-span-" + colSpan, className)}
      onClick={onCardClick}
    >
      <Card className={cn(
        "h-full border-none",
        isSelected && "outline-red-600 outline-2 outline-offset-0",
      )}>
        <CardHeader>
          <p>{title}</p>
        </CardHeader>
        <CardBody className={cn((content) && "h-fit") } >{content ? content : ""}</CardBody>
      </Card>
    </div>
  );
};

export default CardContainer;
