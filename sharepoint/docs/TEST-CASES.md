# Phase 4 validation scenarios

No tests were run against a Microsoft tenant.

1. Station 1 and Station 2 render only their own content.
2. No approved playlist shows an informative message.
3. Safe HTTPS image and video files display and rotate.
4. Invalid or non-HTTPS media URL is rejected.
5. PDF media displays, and arbitrary external HTML remains link-only.
6. Fresh active incident interrupts signage; incident closes/cancels and signage resumes.
7. Dispatch records older than takeover duration are ignored.
8. SharePoint 401/403/500 visibly marks stale data, not an all-clear signal.
9. Access by display user cannot edit SharePoint lists.
10. No Google traffic remains following final cutover.
11. MVIX integration policy and licensing are agreed.
12. No alert routing or life-safety function depends on SharePoint polling.

## Phase 7 additional regression tests (not yet executed in SharePoint)
13. SharePoint list of over 500 rows returns a validated @odata.nextLink; page traversal is bounded.
14. SharePoint nextLink with an external domain or different site prefix is rejected.
15. Changing from Station 1 to Station 2 while a request is pending never renders Station 1 data under the Station 2 header.
16. API 403/500 leaves a visible stale-connection indicator rather than falsely indicating an all-clear.
17. The latest 100 incidents are retrieved in descending dispatch order for the selected station.
18. Verify data source indexing and query thresholds using a large SharePoint incident list.
