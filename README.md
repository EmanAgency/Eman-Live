# Eman Live — Clean Rebuild

This package replaces the old floating-modal prototype with a full-screen mobile app layout.

## Main navigation
Home · Live · Chat · Me

## Me
Profile · Wallet · Income · Levels

## Included
- Full-screen screens instead of floating modal pages
- Live cover required before Go Live
- Smaller, controlled cover preview
- Party cover required before Party
- 4-seat Party Room
- Profile fields and album
- Wallet with all requested coin packages
- Gift catalogue and history
- Income and Friday withdrawal rules
- Wealth + Charm XP
- USDT BNB Smart Chain · BEP20
- LiveKit development token server support
- Supabase authentication/database/storage integration
- Supabase setup SQL

## Before testing
1. Upload these files to the GitHub Pages repository.
2. In Supabase SQL Editor, run `supabase_setup.sql`.
3. Keep the four public storage buckets:
   - profile-pictures
   - album-photos
   - live-covers
   - party-covers
4. Make sure LiveKit Development Token Server is enabled for `emanlive-2j2epi`.

## Important
Real USDT payment confirmation and Friday payouts require a secure server/admin/payment workflow. The front end displays the requested address and records withdrawal requests, but it cannot safely verify blockchain payments by itself.
