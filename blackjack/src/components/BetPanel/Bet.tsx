import { observer } from "mobx-react-lite";
import { FC, MouseEventHandler } from "react";
import { ChipStyled } from "./BetPanel.styled";
import game from "../../store/table";

type BetProps = {
  value: number;
  onBetSet: (e: React.MouseEvent<HTMLElement>) => void;
  color: string;
  size: number;
  className?: string;
};
export const Bet: FC<BetProps> = observer(
  ({ value, onBetSet, color, size, className }) => {
    return (
      <ChipStyled
        className={className ?? ""}
        color={color}
        bet={value}
        onClick={onBetSet}
        size={size}
      />
    );
  }
);
