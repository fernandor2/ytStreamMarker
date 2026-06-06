import streamDeck from "@elgato/streamdeck";
import { MarkerAction } from "./actions/marker-action";

// streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the marker action
streamDeck.actions.registerAction(new MarkerAction());

// Finally, connect to the Stream Deck.
streamDeck.connect();
