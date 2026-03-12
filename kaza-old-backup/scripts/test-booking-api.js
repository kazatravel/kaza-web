
const API_KEY = '27c699b6-2a0b-4c20-b052-7f1c5f93a506';
const API_HOST = 'booking-com.p.rapidapi.com';

async function testBookingApi() {
  console.log('Final check for Booking.com API Connection (using RapidAPI generic host)...');
  
  const hosts = [
    'booking-com.p.rapidapi.com',
    'booking-com15.p.rapidapi.com',
    'booking-com-api3.p.rapidapi.com'
  ];

  for (const host of hosts) {
    console.log(`Checking host: ${host}`);
    const url = host.includes('15') 
        ? `https://${host}/api/v1/hotels/searchDestination?query=London`
        : `https://${host}/v1/hotels/locations?name=London&locale=en-gb`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': host
        }
      });

      console.log(`  Status: ${response.status} ${response.statusText}`);
      const data = await response.json();
      console.log('  Response:', JSON.stringify(data).substring(0, 100));
      
      if (response.ok) {
        console.log(`✅ Success with host: ${host}`);
        return;
      }
    } catch (error) {
      console.log(`  Error with host ${host}: ${error.message}`);
    }
  }
  console.log('❌ All hosts failed. The key is likely invalid or not subscribed to any Booking.com API on RapidAPI.');
}

testBookingApi();
