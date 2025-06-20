-- Seed games data from existing TypeScript data
INSERT INTO games (
  title,
  slug,
  description,
  source,
  category,
  images,
  contract_address,
  is_active,
  opensea_url,
  storage_path,
  release_date
) VALUES
(
  'Cosmic Odyssey: The Void Walker',
  'cosmic-odyssey-the-void-walker',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.

Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Retro-futuristic space exploration RPG',
  'action',
  ARRAY['https://picsum.photos/seed/cosmic7x9/1000'],
  '0x1234567890123456789012345678901234567890',
  true,
  'https://opensea.io/collection/cosmic-odyssey',
  'cosmic-odyssey',
  '2022-01-15'
),
(
  'Dreamscape Defenders: Night Patrol',
  'dreamscape-defenders-night-patrol',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.',
  'Surreal action-adventure with dream manipulation mechanics',
  'action',
  ARRAY['https://picsum.photos/seed/dream3k5/1000/400', 'https://picsum.photos/seed/night8m2/1000'],
  '0x9876543210987654321098765432109876543210',
  true,
  'https://opensea.io/collection/dreamscape-defenders',
  'dreamscape-defenders',
  '2021-09-20'
),
(
  'Culinary Combat: Kitchen Showdown',
  'culinary-combat-kitchen-showdown',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.',
  'Competitive cooking game with tournament mode',
  'action',
  ARRAY['https://picsum.photos/seed/chef9w4/1000'],
  '0x5678901234567890123456789012345678901234',
  true,
  'https://opensea.io/collection/culinary-combat',
  'culinary-combat',
  '2020-11-10'
)
ON CONFLICT (slug) DO NOTHING; 