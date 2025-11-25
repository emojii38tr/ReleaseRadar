import { GoogleGenAI } from "@google/genai";
import { Song } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_DATA: Song[] = [
  { id: '1', artist: 'The Weeknd', title: 'Dancing In The Flames', genre: 'Pop', releaseDate: '2024-09-13' },
  { id: '2', artist: 'Playboi Carti', title: 'All Red', genre: 'Hip Hop', releaseDate: '2024-09-13' },
  { id: '3', artist: 'FKA twigs', title: 'Eusexua', genre: 'Electronic', releaseDate: '2024-09-13' },
  { id: '4', artist: 'Charli XCX', title: 'Talk Talk', genre: 'Pop', releaseDate: '2024-09-12' },
  { id: '5', artist: 'Linkin Park', title: 'The Emptiness Machine', genre: 'Rock', releaseDate: '2024-09-05' },
];

export const fetchNewReleases = async (region: string = 'Worldwide', genreFilter?: string): Promise<Song[]> => {
  try {
    const prompt = `
      Suche nach den neuesten Musik-Releases (Singles und Alben) der letzten 7 Tage weltweit.
      Region Fokus: ${region}.
      ${genreFilter ? `Fokus Genre: ${genreFilter}.` : 'Bitte eine bunte Mischung aus Genres wie Pop, Hip Hop, Electronic, Rock, Latin, K-Pop.'}
      
      Erstelle eine Liste von 10-15 Songs.
      
      WICHTIG: Antworte AUSSCHLIESSLICH im folgenden JSON Format Array, ohne Markdown Formatierung, ohne erklärenden Text davor oder danach:
      
      [
        {
          "artist": "Artist Name",
          "title": "Song Title",
          "album": "Album Name (optional)",
          "genre": "Genre",
          "releaseDate": "YYYY-MM-DD"
        }
      ]
    `;

    // Note: We use googleSearch to get real-time info, but we cannot enforce JSON schema via config when tools are active.
    // We rely on the prompt to format the text output.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    
    // Attempt to extract JSON from the text response (it might be wrapped in ```json ... ```)
    const jsonMatch = text.match(/\[.*\]/s);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((item: any, index: number) => ({
        id: `gen-${Date.now()}-${index}`,
        artist: item.artist,
        title: item.title,
        album: item.album,
        genre: item.genre,
        releaseDate: item.releaseDate,
        coverUrl: `https://picsum.photos/seed/${encodeURIComponent(item.artist + item.title)}/300/300` // Placeholder as we can't get real covers easily without auth
      }));
    } else {
      console.warn("Konnte keine JSON Struktur in der Gemini Antwort finden. Fallback auf Mockdaten.");
      return MOCK_DATA.map(s => ({...s, coverUrl: `https://picsum.photos/seed/${s.id}/300/300`}));
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return mock data on error so the app is usable for demo
    return MOCK_DATA.map(s => ({...s, coverUrl: `https://picsum.photos/seed/${s.id}/300/300`}));
  }
};
