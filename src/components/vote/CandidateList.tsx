import type { PlaceCandidateResponse } from '@/types/place';

type CandidateListProps = {
  candidates: PlaceCandidateResponse[];
  isLoading: boolean;
};

const CandidateList = ({ candidates, isLoading }: CandidateListProps) => {
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
          <div className="flex items-start gap-3 px-4 py-3 border-b border-hairline">
            <span className="flex-none w-6 h-6 mt-0.5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
              <p className="text-xs text-ink-muted-48 mt-0.5 truncate">
                {c.roadAddress ?? c.address}
              </p>
              {c.category && (
                <p className="text-xs text-ink-muted-48 mt-0.5 truncate">{c.category}</p>
              )}
            </div>
            {c.placeUrl && (
              <a
                href={c.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none text-xs text-primary underline whitespace-nowrap pt-0.5"
              >
                지도 보기
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CandidateList;
