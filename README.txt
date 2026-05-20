HYDRANT STATUS PAGE - v1

Upload these files to the same location as server.js:

1. hydrants.html
2. hydrants.css
3. hydrants.js
4. Hydrant Locations.csv

Then open server-hydrants-routes-addon.js and paste the whole block into server.js ABOVE:

app.listen(...)

Test these URLs:

/hydrants
/api/hydrants-status

CSV optional operational columns:

provider
status
flow_gpm
static_psi
last_checked
issue
alternate_supply
notes

Provider values:

Horn Lake Water
Days Water
Walls Water

Status values:

AVAILABLE
OOS
LOW FLOW
UNDER REPAIR
TESTING
PRIVATE

If your CSV does not have provider/status columns yet, the dashboard will default hydrants to AVAILABLE and provider will be guessed as Horn Lake Water unless the location text mentions Days or Walls.
