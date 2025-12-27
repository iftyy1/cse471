
const BASE_URL = 'http://localhost:1092';

async function testPolls() {
  try {
    // 1. Login as Admin
    console.log('Logging in as admin...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@studenthub.com', password: 'admin123' }),
    });

    if (!loginRes.ok) {
      const error = await loginRes.text();
      throw new Error(`Login failed: ${loginRes.status} ${error}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in. Token received.');

    // 2. Create a Poll
    console.log('Creating a poll...');
    const createPollRes = await fetch(`${BASE_URL}/api/polls`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Poll',
        description: 'This is a test poll',
        options: [
          { id: 'opt1', text: 'Option 1' },
          { id: 'opt2', text: 'Option 2' }
        ],
        is_active: true
      }),
    });

    if (!createPollRes.ok) {
      const error = await createPollRes.text();
      throw new Error(`Create poll failed: ${createPollRes.status} ${error}`);
    }

    const poll = await createPollRes.json();
    console.log('Poll created:', poll.id);

    // 3. List Polls
    console.log('Listing polls...');
    const listPollsRes = await fetch(`${BASE_URL}/api/polls?filter=active`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listPollsRes.ok) {
      const error = await listPollsRes.text();
      throw new Error(`List polls failed: ${listPollsRes.status} ${error}`);
    }

    const pollsList = await listPollsRes.json();
    console.log('Polls found:', pollsList.polls.length);

    // 4. Vote on the poll
    console.log('Voting on poll...');
    const voteRes = await fetch(`${BASE_URL}/api/polls/${poll.id}/vote`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ optionId: 'opt1' }),
    });

    if (!voteRes.ok) {
      const error = await voteRes.text();
      throw new Error(`Vote failed: ${voteRes.status} ${error}`);
    }
    console.log('Voted successfully.');

    // 5. Get Poll Details (Check results)
    console.log('Getting poll details...');
    const pollDetailsRes = await fetch(`${BASE_URL}/api/polls/${poll.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!pollDetailsRes.ok) {
      const error = await pollDetailsRes.text();
      throw new Error(`Get poll details failed: ${pollDetailsRes.status} ${error}`);
    }

    const pollDetails = await pollDetailsRes.json();
    console.log('Poll Results:', pollDetails.results);
    console.log('User Vote:', pollDetails.userVote);

    if (pollDetails.results['opt1'] !== 1) {
      throw new Error('Vote count mismatch');
    }
    if (pollDetails.userVote !== 'opt1') {
      throw new Error('User vote mismatch');
    }

    // 6. Delete Poll
    console.log('Deleting poll...');
    const deleteRes = await fetch(`${BASE_URL}/api/polls/${poll.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!deleteRes.ok) {
      const error = await deleteRes.text();
      throw new Error(`Delete poll failed: ${deleteRes.status} ${error}`);
    }
    console.log('Poll deleted successfully.');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testPolls();
