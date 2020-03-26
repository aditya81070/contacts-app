import React, { Component } from "react";
import { Route } from "react-router-dom";
import ListContacts from "./ListContacts";
import CreateContact from "./CreateContact";
import * as ContactsAPI from "./utils/ContactsAPI";
import { Contact, ContactList } from "./types";

export interface AppState {
  contacts: ContactList;
}
class App extends Component<{}, AppState> {
  state = {
    contacts: []
  };

  componentDidMount() {
    ContactsAPI.getAll().then(contacts => this.setState({ contacts }));
  }
  removeContact = (contact: Contact) => {
    this.setState(currentState => ({
      contacts: currentState.contacts.filter(c => c.id !== contact.id)
    }));
    ContactsAPI.remove(contact);
  };

  createContact = (contact: Contact) => {
    ContactsAPI.create(contact).then(contact => {
      this.setState(currentState => ({
        contacts: currentState.contacts.concat([contact])
      }));
    });
  };
  render() {
    return (
      <div className="App">
        <Route
          exact
          path="/"
          render={() => (
            <ListContacts
              contacts={this.state.contacts}
              onDeleteContact={this.removeContact}
            />
          )}
        />
        <Route
          path="/create"
          render={({ history }) => (
            <CreateContact
              onCreateContact={contact => {
                this.createContact(contact);
                history.push("/");
              }}
            />
          )}
        />
      </div>
    );
  }
}

export default App;
