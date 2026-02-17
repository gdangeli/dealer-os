import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, phoneNumberId } = await request.json();

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { success: false, error: 'Access Token und Phone Number ID sind erforderlich' },
        { status: 400 }
      );
    }

    // Test the connection by fetching the phone number details from Meta
    const metaUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
    
    const response = await fetch(metaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta API error:', data);
      
      // Parse Meta error messages
      let errorMessage = 'Token-Test fehlgeschlagen';
      
      if (data.error) {
        if (data.error.message) {
          errorMessage = data.error.message;
        }
        
        // Provide helpful error messages
        if (data.error.code === 190) {
          errorMessage = 'Ungültiger Access Token. Bitte überprüfen Sie den Token.';
        } else if (data.error.code === 100) {
          errorMessage = 'Ungültige Phone Number ID oder keine Berechtigung.';
        }
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    // Extract useful information from the response
    const phoneNumber = data.display_phone_number || data.verified_name || '';
    const displayName = data.verified_name || '';
    const status = data.quality_rating || 'unknown';

    return NextResponse.json({
      success: true,
      phoneNumber,
      displayName,
      status,
      message: 'Verbindung erfolgreich getestet!',
    });

  } catch (error) {
    console.error('Connection test error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Testen der Verbindung' 
      },
      { status: 500 }
    );
  }
}
