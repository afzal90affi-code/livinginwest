export async function POST(request) {
  try {
    const { urlToIndex } = await request.json();

    if (!urlToIndex) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const apiKey = process.env.INDEXNOW_KEY;
    const host = 'livinginwest.com'; 

    const payload = {
      host: host,
      key: apiKey,
      keyLocation: `https://${host}/${apiKey}.txt`,
      urlList: [urlToIndex]
    };

    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 200 || response.status === 202) {
      return Response.json({ 
        success: true, 
        message: "URL submitted to Bing successfully!" 
      });
    } else {
      return Response.json({ 
        success: false, 
        error: `Failed with status ${response.status}` 
      }, { status: 500 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET request se check karne ke liye
export async function GET() {
  return Response.json({ status: "IndexNow API is running on livinginwest.com" });
}