import { useToggleVote } from '@/hooks/useVotes';
import type { PlaceCandidateResponse } from '@/types/place';
import type { VoteResult } from '@/types/vote';

type CandidateItemProps = {
  candidate: PlaceCandidateResponse;
  rank: number;
  voteResult: VoteResult | undefined;
  appointmentId: number;
};

const CandidateItem = ({ candidate: c, rank, voteResult, appointmentId }: CandidateItemProps) => {
  const { mutate: toggleVote, isPending } = useToggleVote(appointmentId);

  const votedByMe = voteResult?.votedByMe ?? false;
  const voteCount = voteResult?.voteCount ?? 0;

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-hairline">
      <span className="flex-none w-6 h-6 mt-0.5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
        <p className="text-xs text-ink-muted-48 mt-0.5 truncate">{c.roadAddress ?? c.address}</p>
        {c.category && <p className="text-xs text-ink-muted-48 mt-0.5 truncate">{c.category}</p>}
        <p className="text-xs text-ink-muted-48 mt-1">{voteCount}명 투표</p>
      </div>
      <div className="flex-none flex flex-col items-end gap-1.5 pt-0.5">
        {c.placeUrl && (
          <a
            href={c.placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline whitespace-nowrap"
          >
            지도 보기
          </a>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => toggleVote({ placeCandidateId: c.id })}
          className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap disabled:opacity-50 ${
            votedByMe ? 'bg-primary text-on-primary' : 'border border-hairline text-ink'
          }`}
        >
          {votedByMe ? '✓ 여기가자' : '여기가자'}
        </button>
      </div>
    </div>
  );
};

export default CandidateItem;
