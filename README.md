# Appoint Funnels CRM

Build a complete production-ready CRM web application for my agency.

The CRM should be heavily inspired by the workflow, information architecture, layout density, navigation patterns, dashboard structure, campaign management experience, analytics presentation, and overall visual feel of Instantly.ai.

IMPORTANT:

This is NOT a generic CRM.

Do NOT make it look like HubSpot, Salesforce, GoHighLevel, Pipedrive, or a generic SaaS dashboard.

The visual reference is the Instantly interface shown in the attached screenshots.

Use the screenshots as the primary visual reference for:

- Sidebar

- Campaign page

- Campaign cards

- Analytics dashboard

- Inbox / reply management

- Typography

- Spacing

- Buttons

- Cards

- Tables

- Filters

- Status badges

- Navigation

- Dashboard density

- General UX

However, the application is our own CRM called:

APPOINT FUNNELS CRM

==================================================

1. ABSOLUTE COLOR RULE

==================================================

DO NOT introduce random colors.

The entire application must use the same visual color language as Instantly.

Primary UI color:

Instantly-style electric blue.

Use blue for:

- Primary buttons

- Active navigation

- Selected states

- Links

- Progress indicators

- Primary icons

- Important actions

- Active campaign states

Use:

- White

- Very light neutral backgrounds

- Light gray borders

- Dark/black text

- Gray secondary text

- Instantly-style blue

for the rest of the interface.

DO NOT USE:

- Purple

- Green as a branding color

- Red as a branding color

- Orange

- Yellow

- Pink

- Gradients

- Neon colors

- Glassmorphism

- Excessive shadows

- Colorful dashboard cards

IMPORTANT:

Statuses may require subtle semantic indicators, but do not turn the dashboard into a rainbow interface.

The application should visually feel like Instantly.

==================================================

2. OVERALL PRODUCT STRUCTURE

==================================================

Create the following main areas:

1. Dashboard

2. Campaigns

3. Leads

4. Inbox

5. Analytics

6. Clients

7. Testimonials / Results

8. Screenshots / Proof

9. Admin Console

10. Settings

The sidebar should remain visible throughout the application.

Use an Instantly-inspired left sidebar with compact icons.

Sidebar structure:

Dashboard

Campaigns

Leads

Inbox

Analytics

Clients

Testimonials

Results

Admin Console

Settings

At the bottom:

- User profile

- Agency name

- Account/settings menu

==================================================

3. DASHBOARD

==================================================

Create a clean agency overview dashboard.

Header:

"Good morning, Zia"

Subtitle:

"Here's what's happening across your client campaigns."

Add date/filter controls.

Main KPI cards:

TOTAL CLIENTS

TOTAL CAMPAIGNS

TOTAL LEADS

TOTAL SENT

TOTAL REPLIES

REPLY RATE

OPPORTUNITIES

OPPORTUNITY VALUE

Example:

Total Clients

12

Active Campaigns

8

Leads

14,820

Emails Sent

11,240

Replies

486

Reply Rate

4.32%

Opportunities

73

Pipeline Value

$184,500

These values must be dynamically calculated from the database.

Do not hardcode dashboard statistics.

Below the KPI cards:

CAMPAIGN PERFORMANCE

Create an Instantly-style analytics graph.

Metrics selectable:

- Sent

- Opens

- Replies

- Opportunities

Allow date ranges:

- Today

- 7 Days

- 30 Days

- 90 Days

- Custom

Below this:

TOP PERFORMING CLIENTS

Table:

Client

Campaigns

Leads

Sent

Replies

Reply Rate

Opportunities

Pipeline Value

Sort by:

- Replies

- Reply rate

- Opportunities

- Pipeline value

==================================================

4. CLIENT MANAGEMENT

==================================================

Create a complete client management system.

Clients page should display cards/table similar to the campaign list in Instantly.

Each client should have:

Company name

Logo

Contact person

Email

Phone

Website

Industry

Status

Campaign count

Lead count

Reply count

Opportunities

Opportunity value

Joined date

Client statuses:

Active

Paused

Completed

Inactive

Clicking a client opens their individual client dashboard.

==================================================

5. CLIENT INNER DASHBOARD

==================================================

This is extremely important.

Every client must have their own dedicated dashboard.

Example:

THE THAMES CONCRETE

At the top:

Client name

Website

Industry

Campaign status

Account manager

Campaign count

Then KPI cards:

TOTAL LEADS

EMAILS SENT

OPEN RATE

REPLIES

REPLY RATE

OPPORTUNITIES

OPPORTUNITY VALUE

MEETINGS BOOKED

Example:

Leads

2,058

Sent

2,058

Open Rate

28.96%

Replies

15

Reply Rate

0.73%

Opportunities

5

Opportunity Value

$5,000

Meetings

2

These metrics must be editable through the Admin Console.

==================================================

6. CLIENT CAMPAIGNS

==================================================

Inside each client dashboard, show:

CAMPAIGNS

Campaign cards/table inspired by Instantly.

Columns:

Campaign Name

Status

Progress

Sent

Opened

Replies

Reply Rate

Opportunities

Opportunity Value

Campaign statuses:

Draft

Active

Paused

Completed

Each campaign can be opened.

Example:

The Thames Concrete

Status:

Active

Progress:

1%

Sent:

262

Opened:

Disabled / 0

Replies:

4

Reply Rate:

3.42%

Opportunities:

0

Opportunity Value:

$0

Do NOT calculate fake metrics.

Metrics must come from stored campaign data.

==================================================

7. CAMPAIGN INNER DASHBOARD

==================================================

When clicking a campaign, open a detailed analytics dashboard.

Header:

Campaign name

Status badge

Client name

Date range selector

Actions:

- Edit

- Pause

- Resume

- Delete

Main analytics cards:

SEQUENCE STARTED

2,058

OPEN RATE

28.96%

596 opens

CLICK RATE

Disabled

OPPORTUNITIES

5

$5,000

REVENUE

$0

Use the same visual hierarchy as the Instantly analytics screenshot.

Below:

PERFORMANCE GRAPH

Create a large interactive graph.

Metrics:

- Sent

- Total opens

- Unique opens

- Total replies

- Total clicks

- Unique clicks

- Opportunities

Allow the user to toggle metrics.

Timeline:

- Day

- Week

- Month

==================================================

8. CAMPAIGN STEP ANALYTICS

==================================================

Below the graph create:

STEP ANALYTICS

Columns:

Step

Sent

Opened

Open Rate

Replied

Reply Rate

Clicked

Click Rate

Opportunities

Example:

Step 1

2,058

596

28.96%

15

0.73%

0

0%

5

Allow multiple steps.

Step 2

Step 3

Step 4

etc.

Each step should have its own analytics.

==================================================

9. ACTIVITY

==================================================

Add an Activity tab beside Step Analytics.

Activity should show:

Lead replied

Lead opened email

Lead clicked

Opportunity created

Lead added

Campaign started

Campaign paused

Campaign edited

Admin changed campaign metrics

Each activity should contain:

Timestamp

Activity type

Lead

Campaign

Client

Description

==================================================

10. LEADS MANAGEMENT

==================================================

Create a complete Leads section.

Table columns:

Name

Company

Email

Phone

Website

Campaign

Client

Status

Last Activity

Created

Lead statuses:

New

Contacted

Opened

Replied

Interested

Meeting Booked

Opportunity

Won

Lost

Lead profile page should contain:

Contact information

Company information

Campaign

Email history

Activity timeline

Notes

Tags

Opportunity information

Allow:

Add Lead

Import CSV

Export CSV

Edit Lead

Delete Lead

Search

Filter

Sort

Filters:

Client

Campaign

Status

Date

Industry

Location

Tags

==================================================

11. INBOX

==================================================

Build an email/reply inbox inspired heavily by Instantly Unibox.

Layout:

LEFT COLUMN

Folders/statuses:

Lead

Interested

Meeting Booked

Meeting Completed

Won

More

Then:

All Campaigns

AI Sales Agent

All Inboxes

MIDDLE COLUMN

Conversation list.

Each conversation:

Lead name/email

Subject

Preview

Timestamp

Status

RIGHT COLUMN

Full conversation.

Show:

Sender

Recipient

Subject

Conversation messages

Timestamp

Actions:

Reply

Forward

Move

Assign

Mark interested

Create opportunity

Book meeting

Add note

The interface should feel very close to the Instantly Unibox experience shown in the screenshot.

==================================================

12. OPPORTUNITIES

==================================================

Create opportunity management.

Every opportunity should contain:

Lead

Company

Client

Campaign

Value

Stage

Created date

Expected close date

Notes

Stages:

New

Qualified

Meeting Booked

Proposal

Negotiation

Won

Lost

Opportunity value should contribute to:

Client pipeline

Campaign pipeline

Agency pipeline

Dashboard totals

Create a simple pipeline view and table view.

==================================================

13. ANALYTICS

==================================================

Create a global analytics section.

Allow analytics to be filtered by:

Client

Campaign

Date

Status

Metrics:

Leads

Emails Sent

Opens

Open Rate

Replies

Reply Rate

Clicks

Click Rate

Opportunities

Opportunity Value

Meetings

Won Deals

Revenue

Create charts and tables.

Keep the interface minimal.

Do not create unnecessary colorful charts.

==================================================

14. TESTIMONIALS

==================================================

Create a dedicated Testimonials section.

This is NOT just a normal testimonial page.

It should work as an internal proof library.

We have previous clients who are no longer actively working with us but produced excellent results.

We want to preserve their:

Company

Industry

Results

Testimonials

Screenshots

Campaign analytics

Messages

Replies

Dashboard results

Each testimonial record should contain:

Client name

Company

Industry

Testimonial text

Client logo

Client photo if available

Result headline

Result description

Campaign

Leads

Emails sent

Replies

Reply rate

Opportunities

Opportunity value

Meetings

Revenue

Screenshots

Example result:

"Generated 5 qualified opportunities from 2,058 prospects."

Metrics should be displayed professionally.

==================================================

15. RESULTS / SOCIAL PROOF

==================================================

Create a Results section.

This should contain case studies.

Each case study should display:

Client logo

Client name

Industry

Headline:

"5 Opportunities Generated From 2,058 Prospects"

Metrics:

2,058

Prospects

596

Opens

15

Replies

5

Opportunities

$5,000

Pipeline

Then display uploaded proof screenshots.

The screenshots must appear inside the client's inner dashboard.

==================================================

16. SCREENSHOT LIBRARY

==================================================

Create a screenshot management system.

Admins can upload screenshots.

Each screenshot contains:

Image

Title

Description

Client

Campaign

Date

Category

Categories:

Campaign Results

Client Reply

Analytics

Testimonial

Dashboard

Before/After

Other

Screenshots should be displayed beautifully.

Use a grid with image previews.

Clicking a screenshot opens a larger preview.

==================================================

17. SHOW PROOF INSIDE CLIENT DASHBOARD

==================================================

IMPORTANT.

At the very bottom of EVERY client inner dashboard create:

RESULTS & PROOF

This section should show the selected screenshots and testimonials associated with that client.

Example:

RESULTS & PROOF

"The campaign generated 5 opportunities from 2,058 prospects."

Then display screenshots.

Use a clean image grid.

Each screenshot can be opened in a lightbox/modal.

Below screenshots:

CLIENT TESTIMONIAL

Display testimonial text.

Then:

RESULT SUMMARY

Leads:

2,058

Replies:

15

Reply Rate:

0.73%

Opportunities:

5

Opportunity Value:

$5,000

This section should make the dashboard look like a professional client results portal.

==================================================

18. ADMIN CONSOLE

==================================================

THIS IS THE MOST IMPORTANT ADMIN FEATURE.

Create a dedicated:

ADMIN CONSOLE

Only administrators can access it.

From here, the admin must be able to control every campaign and client metric shown throughout the CRM.

The Admin Console should NOT be a static settings page.

It should be a complete control center.

==================================================

19. ADMIN CLIENT MANAGEMENT

==================================================

Admin can:

Create client

Edit client

Delete client

Pause client

Activate client

Fields:

Client name

Company

Logo

Website

Industry

Contact name

Contact email

Phone

Status

Notes

==================================================

20. ADMIN CAMPAIGN MANAGEMENT

==================================================

Admin can:

Create campaign

Edit campaign

Delete campaign

Pause campaign

Activate campaign

Archive campaign

Fields:

Campaign name

Client

Status

Start date

End date

Description

==================================================

21. ADMIN CAMPAIGN METRICS

==================================================

Admin must be able to manually update metrics.

This is critical because some historical campaigns may not be connected to an email provider.

For every campaign allow admin to edit:

Leads

Sequence Started

Emails Sent

Total Opens

Unique Opens

Open Rate

Total Clicks

Unique Clicks

Click Rate

Total Replies

Unique Replies

Reply Rate

Opportunities

Opportunity Value

Meetings Booked

Meetings Completed

Won Deals

Revenue

If Open Rate is disabled:

Open Rate:

Disabled

The UI should display:

Disabled

instead of automatically calculating it.

Admin should be able to enable it later.

==================================================

22. MANUAL METRIC MODE

==================================================

Every campaign should support:

LIVE DATA

or

MANUAL DATA

If manual data is selected:

Admin controls the values.

Example:

Leads = 2058

Sent = 2058

Opens = 596

Replies = 15

Opportunities = 5

Opportunity Value = $5,000

The dashboard automatically reflects those numbers.

==================================================

23. ADMIN REPLY MANAGEMENT

==================================================

Admin can manually add replies to a campaign.

Fields:

Lead

Name

Email

Date

Reply text

Campaign

Classification

Classifications:

Interested

Not Interested

Question

Meeting Request

Out of Office

Other

Replies should appear in:

Campaign analytics

Inbox

Client dashboard

==================================================

24. ADMIN OPPORTUNITY MANAGEMENT

==================================================

Admin can manually add opportunities.

Fields:

Lead

Client

Campaign

Value

Stage

Date

Notes

When opportunity value changes, automatically update:

Campaign pipeline

Client pipeline

Global pipeline

==================================================

25. ADMIN LEAD MANAGEMENT

==================================================

Admin can:

Add leads

Bulk import leads

Edit leads

Delete leads

Assign leads to campaign

Assign leads to client

CSV import support.

CSV columns should support:

First Name

Last Name

Company

Email

Phone

Website

Industry

Location

Campaign

Client

Status

==================================================

26. ADMIN SCREENSHOT MANAGEMENT

==================================================

Admin can:

Upload screenshot

Delete screenshot

Replace screenshot

Assign screenshot to client

Assign screenshot to campaign

Add description

Add result title

Reorder screenshots

Uploaded screenshots must automatically appear inside the relevant client dashboard.

==================================================

27. ADMIN TESTIMONIAL MANAGEMENT

==================================================

Admin can:

Create testimonial

Edit testimonial

Delete testimonial

Assign testimonial to client

Upload client logo

Upload testimonial screenshot

Fields:

Client

Company

Testimonial

Result headline

Result description

Results

Screenshots

==================================================

28. ADMIN ACTIVITY LOG

==================================================

Create a complete admin audit log.

Record:

Who changed something

What changed

Old value

New value

Date/time

Example:

Admin changed:

Replies

Old:

12

New:

15

Campaign:

White Time Property

Timestamp:

Aug 30, 2026 04:30

==================================================

29. SEARCH

==================================================

Global search should allow searching:

Clients

Campaigns

Leads

Replies

Opportunities

Testimonials

Screenshots

Use an Instantly-style search experience.

==================================================

30. FILTERING

==================================================

Every major table should support:

Search

Sort

Filter

Do not overcrowd the interface.

Filters should open in compact dropdowns/popovers.

==================================================

31. NOTIFICATIONS

==================================================

Create notifications for:

New reply

New opportunity

Campaign status change

Lead imported

Admin metric update

Use subtle notification indicators.

==================================================

32. DATABASE

==================================================

Create a proper relational database.

Recommended tables:

users

clients

campaigns

campaign_steps

leads

lead_activities

replies

opportunities

meetings

testimonials

results

screenshots

campaign_metrics

campaign_events

notifications

admin_activity_logs

settings

Use relationships properly.

Do not store everything in one giant table.

==================================================

33. DATABASE RELATIONSHIPS

==================================================

Client:

client

↓

campaigns

↓

leads

↓

replies

↓

opportunities

Also:

client

↓

testimonials

↓

results

↓

screenshots

Campaign:

campaign

↓

campaign_steps

↓

campaign_metrics

↓

leads

↓

replies

↓

opportunities

==================================================

34. AUTHENTICATION

==================================================

Create secure authentication.

Roles:

ADMIN

CLIENT

ADMIN:

Can access everything.

CLIENT:

Can only access their own client dashboard.

A client must NEVER be able to see another client's:

Campaigns

Leads

Replies

Analytics

Screenshots

Testimonials

Opportunities

Use proper database-level access control.

==================================================

35. CLIENT PORTAL

==================================================

Client users should see a simplified version of the CRM.

They can view:

Dashboard

Campaigns

Analytics

Leads

Replies

Opportunities

Results & Proof

They cannot access:

Admin Console

Other clients

Internal notes

Agency settings

Admin activity logs

==================================================

36. RESPONSIVE DESIGN

==================================================

Desktop-first.

The primary interface is desktop.

Also support:

Tablet

Mobile

On mobile:

Sidebar becomes collapsible.

Tables become horizontally scrollable or responsive cards.

==================================================

37. UI DESIGN

==================================================

Use:

White background

Very light gray sections

Thin borders

Subtle shadows

Rounded cards

Compact spacing

Clean typography

The interface should feel:

Professional

Fast

Premium

Minimal

Data-heavy

Modern

Again:

DO NOT make it look like a generic AI dashboard.

DO NOT use giant hero sections.

DO NOT use oversized typography.

DO NOT use colorful cards.

DO NOT use gradients.

DO NOT use purple.

DO NOT use unnecessary animations.

==================================================

38. INSTANTLY-STYLE CAMPAIGN PAGE

==================================================

The campaigns page should closely follow the layout shown in the reference screenshot.

Top:

Campaigns

Search box

Status filter

Sort dropdown

"+ Add New" button

Campaign list.

Each campaign row:

Checkbox

Campaign Name

Status

Progress

Sent

Clicks

Replied

Opportunities

Actions menu

Example:

The Thames Concrete

Active

1%

262

0

4

0

Actions

Use the same compact information density.

==================================================

39. INSTANTLY-STYLE ANALYTICS PAGE

==================================================

Follow the second reference screenshot.

Top-left:

Back button

Campaign name

Top-right:

Settings/date/filter controls

Then KPI cards.

Then large analytics graph.

Then:

Step Analytics

Activity

Tabs.

This should feel immediately familiar to someone who has used Instantly.

==================================================

40. INSTANTLY-STYLE INBOX

==================================================

Follow the third screenshot.

Three-column layout:

Folders

Conversation list

Conversation viewer

Use compact spacing.

Left navigation:

Lead

Interested

Meeting booked

Meeting completed

Won

More

Then campaign grouping.

Middle:

Email threads.

Right:

Email content.

==================================================

41. IMAGE UPLOADS

==================================================

Support image uploads for:

Client logos

Client profile images

Testimonials

Campaign proof

Analytics screenshots

Results screenshots

Use proper file storage.

Store image URL/path in database.

Optimize uploaded images.

==================================================

42. DEMO DATA

==================================================

Populate the application with realistic demo data.

Create example clients:

The Thames Concrete

White Time Property

Premier Concrete

Create several campaigns.

Include realistic numbers.

Example campaign:

The Thames Concrete

Leads:

2,058

Sent:

2,058

Opens:

596

Open Rate:

28.96%

Replies:

15

Reply Rate:

0.73%

Opportunities:

5

Opportunity Value:

$5,000

Create realistic lead records and reply conversations.

==================================================

43. DATA CALCULATIONS

==================================================

Where live metrics are available, calculate:

Open Rate =

Unique Opens / Sent × 100

Reply Rate =

Replies / Sent × 100

Click Rate =

Unique Clicks / Sent × 100

Opportunity Rate =

Opportunities / Sent × 100

However:

If admin explicitly marks a metric as manually controlled,

use the manually entered value.

If a metric is disabled,

display:

Disabled

Do not calculate it.

==================================================

44. CAMPAIGN PROGRESS

==================================================

Campaign progress should be represented with a small progress bar similar to Instantly.

Example:

1%

and a subtle horizontal progress indicator.

Progress can be manually controlled from Admin Console.

==================================================

45. EMPTY STATES

==================================================

Create professional empty states.

Examples:

No campaigns yet.

"No campaigns have been created for this client."

Button:

+ Create Campaign

No leads.

"No leads have been added to this campaign."

Button:

+ Add Leads

No replies.

"No replies have been received yet."

==================================================

46. MODALS

==================================================

Use compact modal dialogs for:

Add Client

Add Campaign

Add Lead

Add Reply

Add Opportunity

Upload Screenshot

Add Testimonial

Edit Metrics

Do not navigate to a new page for simple CRUD operations unless necessary.

==================================================

47. TABLE UX

==================================================

Tables should support:

Checkbox selection

Bulk actions

Sorting

Filtering

Pagination

Search

Use subtle row hover effects.

==================================================

48. SIDEBAR

==================================================

Use a narrow Instantly-inspired sidebar.

Icons only where appropriate.

Hovering shows tooltip.

Active item:

Instantly blue background/icon treatment.

Do not use colorful icons.

Icons should primarily be:

Dark gray

Blue when active

==================================================

49. HEADER

==================================================

Top navigation/header should contain:

Page title

Search where appropriate

Notifications

Admin/profile menu

Agency/account selector

For admin:

"My Organization"

For clients:

Their company name

==================================================

50. SETTINGS

==================================================

Create settings for:

Profile

Organization

Users

Roles

Notifications

Campaign defaults

Data settings

Admin only.

==================================================

51. IMPORTANT: NO FAKE FUNCTIONALITY

==================================================

Every button should actually work.

Do NOT create buttons that do nothing.

CRUD operations must work.

Search must work.

Filters must work.

Campaign editing must work.

Metric editing must work.

Screenshot upload must work.

Testimonials must work.

Lead management must work.

Opportunity management must work.

Authentication must work.

Permissions must work.

==================================================

52. ADMIN CONSOLE — MASTER CONTROL

==================================================

The Admin Console is the control center for the entire CRM.

From one place I should be able to select:

Client

↓

Campaign

↓

Metric

and edit the campaign.

For example:

Client:

The Thames Concrete

Campaign:

The Thames Concrete Outreach

Metrics:

Leads

[2058]

Sent

[2058]

Open Rate

[28.96%]

Replies

[15]

Reply Rate

[0.73%]

Opportunities

[5]

Opportunity Value

[$5,000]

Meetings

[2]

Revenue

[$0]

SAVE CHANGES

After clicking Save:

The changes must immediately propagate to:

Dashboard

Client dashboard

Campaign dashboard

Analytics

Campaign list

Results section

Opportunity totals

==================================================

53. CLIENT RESULTS SECTION

==================================================

Every client dashboard must end with:

--------------------------------

RESULTS & PROOF

Campaign Results

[Large Screenshot]

[Large Screenshot]

[Large Screenshot]

Client Testimonial

"Testimonial text here..."

Performance Summary

Leads       2,058

Sent        2,058

Replies     15

Reply Rate  0.73%

Opportunities 5

Pipeline    $5,000

--------------------------------

Make this section visually polished enough that it could eventually be shown directly to the client as proof of performance.

==================================================

54. PERFORMANCE

==================================================

The CRM should load quickly.

Use:

Lazy loading

Pagination

Optimized database queries

Image optimization

Caching where appropriate

Do not load thousands of leads at once.

==================================================

55. FINAL DESIGN TEST

==================================================

Before considering the application complete, compare every major screen against the supplied Instantly screenshots.

The following should immediately feel like the same product family:

Campaigns

Analytics

Inbox

Tables

Cards

Sidebar

Filters

Dropdowns

Status badges

Graphs

Spacing

But the application must be branded as:

APPOINT FUNNELS CRM

Do not copy Instantly's logo or trademarks.

Use our own branding.

==================================================

56. FINAL REQUIREMENT

==================================================

Build this as a real usable CRM, not a static mockup.

The primary purpose is:

Manage all agency clients

Manage all campaigns

Manage leads

Manage replies

Manage opportunities

Track campaign performance

Store historical results

Store testimonials

Store screenshots

Give clients a clean performance dashboard

Allow administrators to manually control historical campaign metrics

The most important workflow is:

ADMIN

↓

CLIENT

↓

CAMPAIGN

↓

LEADS

↓

REPLIES

↓

OPPORTUNITIES

↓

RESULTS / PROOF

Everything must be connected.

The entire interface should feel:

INSTANTLY-INSPIRED

MINIMAL

PREMIUM

FAST

CLEAN

DATA-DENSE

PROFESSIONAL

Use ONLY the Instantly-style color palette described above.

NO PURPLE.

NO GRADIENTS.

NO RANDOM COLORS.

NO GENERIC AI DASHBOARD DESIGN.

NO EXCESSIVE ANIMATIONS.

NO UNNECESSARY UI.

Build the complete application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0bf25b4-8521-444d-8ff8-88d124fbc23f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
