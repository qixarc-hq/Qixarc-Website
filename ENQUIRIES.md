# Live enquiry delivery

Both the home and Contact forms submit to `public.qixarc_enquiries` in the
**QIXARC Website** Supabase project (`iosmotdjsrwuktpzrxvu`). Delivery means
storage in the private admin inbox; email notifications are a separate integration.

## Read enquiries

Open `https://www.qixarc.com/admin/` and use the existing company admin login.
Choose Enquiries and Refresh. Records can be marked new, read or archived.
The password is not in this repository. Admin access is controlled by
`qixarc_admins` membership and row-level security.

## Submission behavior

- Only the publishable key is included in browser code.
- Success appears after Supabase confirms insertion, or confirms that an
  identical retry with the same ID was previously inserted.
- A changed enquiry receives a new ID; an unchanged retry reuses its ID.
- Requests time out after 15 seconds. Failed or timed-out submissions retain
  their details and provide the direct company email as a fallback.
- Fields are disabled while sending, preventing edits from being discarded
  when an in-flight submission succeeds.

## If delivery stops

1. Check the Supabase project's status first. An inactive/paused project cannot
   receive enquiries. Resume the existing project and wait for `ACTIVE_HEALTHY`.
2. Check that the website configuration still points to the project above and
   uses an enabled publishable key.
3. Check the tables, column grants and policies against
   `scripts/supabase-schema.sql`. Never rerun table creation blindly over an
   existing database or make enquiries publicly readable.
4. Submit a clearly labelled test from the live form, then verify that exact
   record in Supabase and through the admin read policy. Archive the test after
   verification so it is distinguishable from a client lead.

Supabase Free projects may pause after low activity. See the official
[project pausing guide](https://supabase.com/docs/guides/platform/free-project-pausing).
A plan change requires the owner's billing decision; restoring the current
project does not add a subscription or create a replacement project.
