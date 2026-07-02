export type ConfirmedPlace = {
  id: number;
  appointmentId: number;
  placeCandidateId: number;
  confirmedByUserId: number;
  confirmedAt: string;
};

export type ConfirmPlaceRequest = {
  placeCandidateId: number;
};
