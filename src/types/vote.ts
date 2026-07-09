export type VoteResult = {
  placeCandidateId: number;
  voteCount: number;
  votedByMe: boolean;
};

export type ToggleVoteRequest = {
  placeCandidateId: number;
};
