## Breakdown of ESPN API

### ESPN API Overview
Routes:

1. Scoreboard
   - url: https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard 
   - Contents of Endpoint:
     - Covers the whole league
     - Contains All Events Scheduled, including past Events starting this calendar year
     - Contains basic match information for the current event
     - Current Event is in the Events: [] Object, with the first event being the current event, but doesn't immediately update
     - Provides who the winner is, doesn't say how

2. Event Detail
    - url: https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events/600041733?lang=en%C2%AEion=us
    - Contents of Endpoint:
      - Contains information about the event
      - Says which segment of the card each fight is on
      - Doesn't provide fighter information, links to an athlete page
      - Does provide who the winner is

3. Athlete Detail
    - url: https://sports.core.api.espn.com/v2/sports/mma/athletes/2614933?lang=en%C2%AEion=us
    - Contents of Endpoint:
      - Contains information about the athlete
      - Contains the athlete's name, weight class
      - Provides refs to Record, Stats, Ranks sometimes
      - Doesn't provide fight history

4. Athlete Records
    url: https://sports.core.api.espn.com/v2/sports/mma/athletes/2614933/records?lang=en%C2%AEion=us
    - Contents of Endpoint:
      - Contains the athlete's fight record stats
      - Provides the athlete's fight history, including wins, losses, draws, and no contests
      - Doesn't provide the opponent's name
