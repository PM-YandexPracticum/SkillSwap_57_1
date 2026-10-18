import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuthUserId } from "@/features/auth/model/authSlice";
import { useRequireAuth } from "@/features/auth/model/useRequireAuth";
import { createRequest, selectHasRequest } from "@/entities/request/model/requestsSlice";
import { SwapRequestSuccessModal } from "./SwapRequestSuccessModal";
import { Button } from "@/shared/ui/Button";
import ClockIcon from "@/shared/assets/icons/clock.svg?react";

type SwapRequestButtonProps = {
  skillId: string
  ownerId: string
  className?: string
}

export const SwapRequestButton = ({ skillId, ownerId, className }: SwapRequestButtonProps) => {
  const currentUserId = useAppSelector(selectAuthUserId);

  const hasRequest = useAppSelector((state) =>
    currentUserId ? selectHasRequest(state, skillId, currentUserId) : false,
  );

  const dispatch = useAppDispatch();
  const requireAuth = useRequireAuth();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  if (currentUserId && currentUserId === ownerId) {
    return null;
  }

  const handleSwapClick = () => {
    requireAuth(() => {
      if (currentUserId) {
        dispatch(
          createRequest({
            skillId,
            fromUserId: currentUserId,
            toUserId: ownerId,
          }),
        );
        setIsSuccessModalOpen(true);
      }
    });
  }

  return (
    <>
      <Button
        variant={hasRequest ? 'secondary' : 'primary'}
        disabled={hasRequest}
        onClick={handleSwapClick}
        iconLeft={hasRequest ? <ClockIcon /> : undefined}
        className={className}
      >
        {hasRequest ? 'Обмен предложен' : 'Предложить обмен'}
      </Button>
      {isSuccessModalOpen && (
        <SwapRequestSuccessModal onClose={() => setIsSuccessModalOpen(false)} />
      )}
    </>
  )
}
