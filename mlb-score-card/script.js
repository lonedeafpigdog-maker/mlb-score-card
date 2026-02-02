document.addEventListener('DOMContentLoaded', () => {
  const gamesList = document.getElementById('gamesList');
  const allBtn = document.getElementById('allGamesBtn');
  const raysBtn = document.getElementById('raysOnlyBtn');

  let showRaysOnly = false;

  async function fetchScores() {
    gamesList.innerHTML = '<p>Loading MLB games...</p>';

    try {
      const today = '2025-04-05'; //new Date().toISOString().split('T')[0]; // "2026-02-01" format
      const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?hydrate=team,venue&sportId=1&date=${today}`;
      const scheduleResponse = await fetch(scheduleUrl);
      if (!scheduleResponse.ok) throw new Error('Schedule fetch failed');

      const scheduleData = await scheduleResponse.json();

      gamesList.innerHTML = '';

      if (!scheduleData.dates?.[0]?.games?.length) {
        gamesList.innerHTML = '<p>No games today — off-season. Check back in spring!</p>';
        return;
      }

      let games = scheduleData.dates[0].games;

      if (showRaysOnly) {
        games = games.filter(game => 
          game.teams.away.team.id === 139 || game.teams.home.team.id === 139
        );
      }

      if (games.length === 0) {
        gamesList.innerHTML = '<p>No Rays games today.</p>';
        return;
      }

      // Fetch boxscores for each game
      for (const game of games) {
        const gamePk = game.gamePk;
        const boxUrl = `https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`;
        const boxResponse = await fetch(boxUrl);
        const boxData = await boxResponse.json();

        const homeScore = boxData.teams?.home?.teamStats?.batting?.runs || '-';
        const awayScore = boxData.teams?.away?.teamStats?.batting?.runs || '-';

        const card = document.createElement('div');
        card.classList.add('game-card');

        card.innerHTML = `
          <div class="team away">
    <img src="https://a.espncdn.com/i/teamlogos/mlb/500/${game.teams.away.team.abbreviation.toLowerCase()}.png" width="40" height="40" />
    <span>${game.teams.away.team.name}</span>
  </div>
  <div class="score-center">${awayScore} - ${homeScore}</div>
  <div class="team home">
    <span>${game.teams.home.team.name}</span>
    <img src="https://a.espncdn.com/i/teamlogos/mlb/500/${game.teams.home.team.abbreviation.toLowerCase()}.png" width="40" height="40" />
  </div>
`;

        gamesList.appendChild(card);
      }
    } catch (error) {
      gamesList.innerHTML = `<p>Error: ${error.message}</p>`;
      console.error(error);
    }
  }

  allBtn.addEventListener('click', () => {
    showRaysOnly = false;
    fetchScores();
  });

  raysBtn.addEventListener('click', () => {
    showRaysOnly = true;
    fetchScores();
  });

  // Load default
  fetchScores();
});