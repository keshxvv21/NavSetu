# API Contract

TODO: write request and response JSON for each endpoint in hour 1 so frontend and backend can work in parallel.

| Route | Who | Request | Response |
|-------|-----|---------|----------|
| POST /api/auth/login | All | TODO | TODO |
| GET /api/problems | All | TODO | TODO |
| POST /api/problems | Dept | TODO | TODO |
| GET /api/problems/[id]/applications | Dept | TODO | TODO |
| POST /api/applications | Startup | TODO | TODO |
| POST /api/applications/[id]/select | Dept | TODO | TODO |
| POST /api/milestones/[id]/submit | Startup | TODO | TODO |
| POST /api/milestones/[id]/review | Dept | TODO | TODO |
| POST /api/pilots/[id]/convert | Dept | TODO | TODO |
| GET /api/contracts/[id]/pdf | All | TODO | PDF |
| GET /api/verify/[id] | Public | TODO | { verified, storedHash, computedHash, summary } |
| GET /api/adoptions | All | TODO | TODO |
| POST /api/adoptions | Dept | TODO | TODO |
