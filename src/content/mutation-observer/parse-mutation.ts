type ParseMutation = (m: MutationRecord) => Node[];
export const parseMutation: ParseMutation = mutation => {
  switch (mutation.type) {
    case 'characterData':
      return [mutation.target];
    case 'childList':
      return mutation.addedNodes.length > 0 ? Array.from(mutation.addedNodes) : [];
    case 'attributes':
      return [mutation.target];
    default:
      return [];
  }
};
