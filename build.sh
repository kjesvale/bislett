rm -rf build
mkdir build
bun run src/calendar/index.ts
mv bislett.ics build
cp src/website/* build