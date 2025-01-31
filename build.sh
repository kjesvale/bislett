rm -rf build
mkdir build
bun run src/calendar/index.ts
mv kalender.ics build
cp src/website/* build