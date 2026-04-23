const crossCheck = require('../service/crossCheck')

describe('crossCheck', () => { 
    describe('findMatch', () => { 
        const mockAnimes = [
            {
                title: 'Attack on Titan',
                native: '進撃の巨人',
                romaji: 'Shingeki no Kyojin',
                english: 'Attack on Titan'
            },
            {
                title: 'My Hero Academia',
                native: '僕のヒーローアカデミア',
                romaji: 'Boku no Hero Academia',
                english: 'My Hero Academia'
            },
            {
                title: 'Demon Slayer',
                native: '鬼滅の刃',
                romaji: 'Kimetsu no Yaiba',
                english: 'Demon Slayer'
            },
            {
                title: 'One Piece',
                native: 'ワンピース',
                romaji: 'Wan Pīsu',
                english: 'One Piece'
            },
            {
                title: 'Jujutsu Kaisen',
                native: '呪術廻戦',
                romaji: 'Jujutsu Kaisen',
                english: 'Jujutsu Kaisen'
            }
        ];
        const mockFuse = crossCheck.createFuse(mockAnimes)
        it('should return anime when titles are matching', () => {
            const mockAnimeToFind = {
                title: 'Jujutsu Kaisen',
                native: '呪術廻戦',
                romaji: 'Jujutsu Kaisen',
                english: 'Jujutsu Kaisen'
            }
            const find = crossCheck.findMatch(mockAnimeToFind, mockFuse)
            expect(find).toEqual(mockAnimeToFind)
        })
        it('should return anime when titles are partially matching', () => {
            const mockAnimeToFind = {
                title: 'DemonSlayer'
            }
            const find = crossCheck.findMatch(mockAnimeToFind,mockFuse)
            expect(find).toEqual({
                title: 'Demon Slayer',
                native: '鬼滅の刃',
                romaji: 'Kimetsu no Yaiba',
                english: 'Demon Slayer'
            })
        })
     })
    describe('crossCheck', () => {
        it('should correctly return anime if in all 3 collections', async () => {
            
            const sharedAnime = {
                title: 'Attack on Titan',
                native: '進撃の巨人',
                romaji: 'Shingeki no Kyojin',
                english: 'Attack on Titan',
                description: 'Shared Anime'
            };
            const mockJikan = [{...sharedAnime}];
            const mockAniList = [{...sharedAnime}];
            const mockAnimeSchedule = [{...sharedAnime}];
         // Mockne checkImages, aby jen vracela matched pole beze změn, kvůli zamezení async stahování obrázků při testu.
            const originalCheckImages = crossCheck.checkImages;
            crossCheck.checkImages = async ({ matched }) => matched;

            const { animes } = await crossCheck.crossCheck({ animeSchedule: mockAnimeSchedule, aniList: mockAniList, jikan: mockJikan });
            
            crossCheck.checkImages = originalCheckImages;

            expect(animes.length).toBe(1);
            expect(animes[0].title).toBe('Attack on Titan');
            expect(animes[0].verified).toBe(true);
        });
        it('should correctly return anime if only 2 collections an mark it as verified = false', async () => {

            const sharedAnime = {
                title: 'Attack on Titan',
                native: '進撃の巨人',
                romaji: 'Shingeki no Kyojin',
                english: 'Attack on Titan',
                description: 'Shared Anime'
            };
            const wrongAnime = {
                title: 'Demon Slayer',
                native: '鬼滅の刃',
                romaji: 'Kimetsu no Yaiba',
                english: 'Demon Slayer'
            }
            const mockJikan = [{...sharedAnime}];
            const mockAniList = [{...wrongAnime}];
            const mockAnimeSchedule = [{...sharedAnime}];

            const originalCheckImages = crossCheck.checkImages;
            crossCheck.checkImages = async ({ matched }) => matched;

            const { animes } = await crossCheck.crossCheck({ animeSchedule: mockAnimeSchedule, aniList: mockAniList, jikan: mockJikan });
            
            // Obnoví původní checkImages
            crossCheck.checkImages = originalCheckImages;

            expect(animes.length).toBe(1);
            expect(animes[0].title).toBe('Attack on Titan');
            expect(animes[0].verified).toBe(false);
        })
        it('should go through with verification even if one collection is down', async () => {

            const sharedAnime = {
                title: 'Attack on Titan',
                native: '進撃の巨人',
                romaji: 'Shingeki no Kyojin',
                english: 'Attack on Titan',
                description: 'Shared Anime'
            };
            const mockJikan = [{...sharedAnime}];
            const mockAniList = undefined;
            const mockAnimeSchedule = [{...sharedAnime}];
            // Mockne checkImages, aby jen vracela matched pole beze změn, kvůli zamezení async stahování obrázků při testu.
            const originalCheckImages = crossCheck.checkImages;
            crossCheck.checkImages = async ({ matched }) => matched;

            const { animes } = await crossCheck.crossCheck({ animeSchedule: mockAnimeSchedule, aniList: mockAniList, jikan: mockJikan });
            
            crossCheck.checkImages = originalCheckImages;

            expect(animes.length).toBe(1);
            expect(animes[0].title).toBe('Attack on Titan');
            expect(animes[0].verified).toBe(false);
        })
        it('should not increment verificationCount twice for duplicate titles', async () => {
            const sharedAnime = {
                title: 'Attack on Titan',
                native: '進撃の巨人',
                romaji: 'Shingeki no Kyojin',
                english: 'Attack on Titan',
                description: 'Shared Anime'
            };
            const mockJikan = [{...sharedAnime}, {...sharedAnime}];
            const mockAniList = [{...sharedAnime}];
            const mockAnimeSchedule = [{...sharedAnime}];
            // Mockne checkImages, aby jen vracela matched pole beze změn, kvůli zamezení async stahování obrázků při testu.
            const originalCheckImages = crossCheck.checkImages;
            crossCheck.checkImages = async ({ matched }) => matched;

            const { animes } = await crossCheck.crossCheck({ animeSchedule: mockAnimeSchedule, aniList: mockAniList, jikan: mockJikan });

            crossCheck.checkImages = originalCheckImages;

            expect(animes.length).toBe(1);
            expect(animes[0].title).toBe('Attack on Titan');
            expect(animes[0].verificationCount).toBe(3);
            expect(animes[0].verificationCount).not.toBe(4);
            expect(animes[0].verified).toBe(true);
        })
    });
 })