import streamDeck from "@elgato/streamdeck";
import { MarkerAction } from "./actions/marker-action";
import { OpenBrowserAction } from "./actions/open-browser-action";

// Register the actions
streamDeck.actions.registerAction(new MarkerAction());
streamDeck.actions.registerAction(new OpenBrowserAction());

// Finally, connect to the Stream Deck.
streamDeck.connect();
