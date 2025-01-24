rm -rf build
mkdir build
bun run src/calendar/make.ts
mv bislett.ics build
cp src/index.html build