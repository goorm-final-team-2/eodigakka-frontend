import CandidateItem from '@/components/vote/CandidateItem';
import type { PlaceCandidateResponse } from '@/types/place';
import type { VoteResult } from '@/types/vote';

type CandidateListProps = {
  candidates: PlaceCandidateResponse[];
  isLoading: boolean;
  voteResults: VoteResult[];
  appointmentId: number;
};

const CandidateList = ({
  candidates,
  isLoading,
  voteResults,
  appointmentId,
}: CandidateListProps) => {
  if (isLoading) {
    return <p className="px-4 py-8 text-center text-sm text-ink-muted-48">불러오는 중...</p>;
  }

  if (candidates.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-ink-muted-48">
        아직 추천된 장소가 없어요. 장소를 검색해서 추천해보세요!
      </p>
    );
  }

  return (
    <ul>
      {candidates.map((c, idx) => (
        <li key={c.id}>
          <CandidateItem
            candidate={c}
            rank={idx + 1}
            voteResult={voteResults.find((v) => v.placeCandidateId === c.id)}
            appointmentId={appointmentId}
          />
        </li>
      ))}
    </ul>
  );
};

export default CandidateList;
