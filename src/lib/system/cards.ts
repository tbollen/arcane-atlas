// All the required classes, types and information for cards

// Dyanmically import the properties for each system
import { availableGameSystems } from './gameSystems';
let system: (typeof availableGameSystems)[number] = 'arcane-rift'; // Default system

import { AR_Card } from './ArcaneRift/cards';

// Temporary: set Item to AR_Item (only available system for now)
export class Item extends AR_Card {}
