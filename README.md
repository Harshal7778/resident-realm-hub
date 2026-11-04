# Society Hub

Create a new Society Management React application from scratch.

IMPORTANT:

This is the INITIAL BUILD of a brand-new project.

Do NOT assume that any existing Society Management application, components, routes, services, database, or data already exist.

Do NOT rebuild or reset anything because this is a fresh project.

Do NOT implement features from future phases yet.

Focus ONLY on the foundation, authentication, navigation, role system, mock data architecture, persistence, and mobile app shell described below.

Build cleanly so future phases can extend this project without major rewrites.

GOAL:

Create a polished mobile-first Android-style Society Management PWA prototype.

TECH:

React

TypeScript

Tailwind CSS

shadcn/ui where useful

React Router

localStorage for persistence

React Context or a lightweight state-management approach

Modular component architecture

==================================================

APP SHELL

==================================================

Create a mobile-first application shell.

Primary target widths:

360px

390px

412px

Desktop should remain usable, but mobile is the priority.

Do NOT create a traditional desktop admin sidebar.

Use:

Mobile top app bar

Bottom navigation

Mobile cards

Rounded corners

Bottom sheets/dialogs

Toast notifications

Skeleton/loading states

Empty states

Confirmation dialogs

Smooth but minimal transitions

Large touch-friendly controls

On desktop, center the application inside a mobile-style container where appropriate.

Use a clean white/light Material-inspired design.

Avoid:

Excessive gradients

Excessive animations

Desktop-style admin dashboard layouts

Unnecessary visual complexity

==================================================

2. SPLASH SCREEN

Create a simple splash screen.

Show:

Society logo/icon

"Society Management"

"Green Valley Society"

After the splash screen:

If logged in:

? Dashboard

If not logged in:

? Login

Keep the splash short and polished.

==================================================

3. AUTHENTICATION

Create:

/login

/otp

Login screen:

Society logo

Society name

Mobile number field

Send OTP button

Validation for mobile number

Loading state

Error state

OTP screen:

6 digit OTP input

Verify button

Resend OTP

Countdown timer

Invalid OTP error state

Loading state

Mock OTP:

123456

Only registered active society mobile numbers should be allowed to log in.

Do NOT integrate real SMS.

Do NOT integrate Firebase authentication yet.

Keep the authentication service abstract so real authentication can be added later.

==================================================

4. DEMO LOGIN

Keep the normal:

Mobile Number

? OTP

? Login

flow.

Also provide small demo-login options for prototype testing:

Continue as Admin

Continue as Secretary

Continue as Treasurer

Continue as Member

These demo buttons should simulate the same authenticated experience and set the correct role.

Create these demo users:

Admin:

Name: Rajesh Patel

Role: ADMIN

House: H01

Mobile: 9000000001

Secretary:

Name: Amit Shah

Role: SECRETARY

House: H02

Mobile: 9000000002

Treasurer:

Name: Karan Patel

Role: TREASURER

House: H03

Mobile: 9000000003

Member:

Name: Sunil Patel

Role: MEMBER

House: H12

Mobile: 9000000012

The demo users must use the same user/session system as normal OTP login.

==================================================

5. DOMAIN TYPES

Create clean TypeScript interfaces/types for:

Society

House

Member

MobileNumber

User

Role

Permission

Use proper IDs and timestamps where appropriate.

Create enums/unions/constants for:

ADMIN

SECRETARY

TREASURER

MEMBER

Do not implement all future domain models yet unless they are required for the foundation architecture.

==================================================

6. DEMO SOCIETY DATA

Create one demo society:

Green Valley Society

Create 25 houses:

H01

H02

H03

H04

H05

H06

H07

H08

H09

H10

H11

H12

H13

H14

H15

H16

H17

H18

H19

H20

H21

H22

H23

H24

H25

Use realistic Indian names.

Each house should support:

House number

Member/owner name

Multiple mobile numbers

Active/inactive status

Seed realistic demo data.

At least some houses should have multiple mobile numbers so the data model is tested properly.

Do not permanently delete houses or members.

==================================================

7. SERVICE ARCHITECTURE

Create a clean repository/service abstraction.

Create:

authService

memberService

The services should use localStorage/mock data for now.

IMPORTANT:

UI components must NOT directly manipulate raw mock-data arrays.

Components should communicate through service functions or a clean state/repository layer.

Structure the service layer so it can later be replaced with REST API calls without rewriting the UI.

Use predictable async-style service functions where practical.

==================================================

8. ROLE SYSTEM

Create these roles:

ADMIN

SECRETARY

TREASURER

MEMBER

Create basic permission constants/types.

ADMIN:

Full access.

SECRETARY:

Configurable permissions.

TREASURER:

Configurable permissions.

MEMBER:

Own member information only.

Implement frontend role-based:

Route visibility

Navigation visibility

Component visibility

Action visibility

IMPORTANT:

This is prototype UX-level authorization only.

The final production backend must enforce all permissions server-side.

==================================================

9. NAVIGATION

Member bottom navigation:

Home

Events

Payments

Inventory

Profile

Admin/Secretary/Treasurer bottom navigation:

Home

Events

Finance

Inventory

More

Create placeholder screens for future modules.

Do NOT implement the future module functionality yet.

More screen placeholders:

Members

Meetings

Attendance

Notices

Notifications

Reports

Users & Roles

Settings

Audit Logs

Only show options that are appropriate for the current role.

For future screens, show a polished empty/placeholder state such as:

"Coming in the next module."

Do not build the actual future functionality yet.

==================================================

10. ROUTING

Set up protected routing.

Initial routes:

/login

/otp

/dashboard

/profile

Create placeholder routes for the future navigation where required:

/events

/payments

/inventory

/members

/meetings

/attendance

/notices

/notifications

/reports

/admin/users

/admin/roles

/admin/permissions

/admin/audit

/settings

Unauthorized users should not be able to access role-restricted placeholder pages.

==================================================

11. DASHBOARD PLACEHOLDER

Create initial dashboards.

MEMBER DASHBOARD:

Greeting:

"Good Morning, Sunil ??"

House:

"H12"

Cards:

Upcoming Event

"Diwali Function 2026"

Pending Contribution

"?500"

Upcoming Meeting

"25 Aug 2026 • 8:00 PM"

Inventory Request

"1 request pending"

Notices

"2 unread"

These are currently demo/placeholder values.

Do NOT implement event, payment, inventory, meeting, notice, or notification business logic yet.

ADMIN DASHBOARD:

Show:

Members:

25

Current Event:

Diwali Function 2026

Expected Contribution:

?25,000

Collected:

?23,500

Pending:

?1,500

Extra:

?1,500

Expenses:

?12,000

Balance:

?13,000

Pending Inventory Returns:

2

These values are currently demo/placeholder values and must NOT be treated as real calculated financial data yet.

Quick actions:

Create Event

Record Payment

Add Expense

Create Meeting

Create Notice

Add Inventory

For now, these can navigate to the appropriate placeholder screen.

==================================================

12. PROFILE

Create profile screen.

Show:

Name

House Number

Mobile Number

Role

Options:

Notifications

About

Logout

The current member/user must NOT be able to change:

House assignment

Role

Permissions

For now, profile editing can be limited to basic allowed information.

==================================================

13. PERSISTENCE

Persist using localStorage:

Logged-in user

Authentication/session state

Selected demo role

Society data

Member/house data

Mobile numbers

Refresh the browser:

The application should preserve the current authenticated session.

Logout should clear the session correctly.

Do not lose seeded society data when the user logs out.

==================================================

14. REUSABLE COMPONENTS

Create reusable components where appropriate:

AppHeader

BottomNavigation

StatusBadge

StatCard

EmptyState

LoadingState

ConfirmDialog

SearchBar

FilterChips

Do not create unnecessary duplicate components.

Keep components modular and easy to extend.

==================================================

15. UX

Add:

Friendly form validation

Loading states

Error states

Toast notifications

Empty states

Logout confirmation

Accessible buttons

Large mobile touch targets

Good color contrast

Forms should never silently fail.

Show user-friendly error messages.

Do not show technical stack traces to users.

==================================================

16. RESPONSIVE DESIGN

Primary mobile targets:

360px

390px

412px

Ensure:

No horizontal scrolling

No clipped buttons

Forms fit on mobile

Bottom navigation remains usable

Cards fit correctly

Dialogs fit mobile screens

Text wraps correctly

Desktop should remain functional.

On desktop, use a centered mobile-app presentation where appropriate rather than turning the whole application into a traditional desktop dashboard.

==================================================

17. PWA FOUNDATION

Set up the basic PWA foundation if practical:

Mobile viewport

Theme color

Manifest

Standalone display

App name: Society Management

Use a simple society/community app icon placeholder if needed.

Do not spend significant implementation effort on advanced offline functionality yet.

==================================================

18. CODE QUALITY

Keep the project modular.

Do NOT create one giant component.

Use:

TypeScript types

Reusable components

Service layer

Clean routing

Clear folder structure

Predictable state management

Future modules must be able to plug into this architecture without rewriting the foundation.

==================================================

19. IMPORTANT SCOPE LIMIT

For this first build, DO NOT implement the actual functionality for:

Events

Contributions

Payments

Expenses

Meetings

Attendance

Notices

Notifications

Inventory

Reports

Users & Roles management

Permission management

Audit logs

Only create their navigation/route placeholders where necessary.

These features will be implemented in later phases.

==================================================

20. ACCEPTANCE TEST

The following must work before considering this phase complete:

Open app

See splash screen

Reach login

Enter registered mobile number

Send OTP

Enter 123456

Reach correct dashboard

See correct role-based navigation

Try demo Admin login

Try demo Secretary login

Try demo Treasurer login

Try demo Member login

Verify each role sees the correct navigation

Member cannot access admin-only placeholder routes

Refresh page and remain logged in

Logout

Login again

Open profile

See correct user information

Verify 25 demo houses exist in the seeded data

Verify multiple mobile numbers are supported

Verify data persists after refresh

IMPORTANT FINAL INSTRUCTION:

Do not implement future modules in this build.

Do not over-engineer.

Do not add unrelated features.

Prioritize:

Clean mobile UI

Correct authentication

Correct role handling

Clean service architecture

Local persistence

Extensibility for the next development phases

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://resident-realm-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d7863ab1-a7ea-44cb-abdd-9f352ce51908).

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
