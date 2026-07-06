# Data Sources

## Baguio Tourism Records

VISITA is the official Baguio tourism portal and presents itself as the City Government of Baguio's official tourism service. The app treats VISITA as the preferred source for tourism records, but it does not scrape undocumented VISITA internals.

Production data should come from one of these paths:

1. Manual admin curation from VISITA or City Tourism Office source pages.
2. A city-approved export or API feed.
3. Direct database entry by authorized tourism staff.

Source:

- https://visita.baguio.gov.ph/

## Holiday And Event Pressure

The starter calendar includes 2026 Philippine holiday pressure windows from the Philippine News Agency's coverage of Proclamation 1006 and Panagbenga 2026 pressure windows from the official Panagbenga schedule.

Sources:

- https://www.pna.gov.ph/articles/1258046
- https://www.panagbengaflowerfestival.com/event-directory/

## Maps

Attraction cards use external map search links based on location text. The app does not store geocoded coordinates from Mapbox or another geocoder.

Mapbox temporary geocoding results cannot be cached or stored. Store coordinates only if the project has a permitted permanent-geocoding plan or receives coordinates from an approved source.

Source:

- https://docs.mapbox.com/api/search/geocoding/
