import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  AsyncStorage,
  ImageBackground
} from "react-native";
import { AppLoading } from "expo";

import ToDo from "./ToDo";

const { height, width } = Dimensions.get("window");
const randomImages = [
  require('./images/talv.jpg'),
  require('./images/kevad.jpg'),
  require('./images/suvi.jpg'),
  require('./images/sügis.jpg'),
  require('./images/sild.jpg'),
  require('./images/sudu.jpg'),
];

export default class App extends React.Component {
  state = {
    newToDo: "",
    loadedToDos: false,
    toDos: {},
    currentImage: null,
  };


  componentDidMount = () => {
    this._loadedToDos();
    this.currentImage = randomImages[Math.floor(Math.random()*randomImages.length)];
  };

  render() {
    const { newToDo, loadedToDos, toDos } = this.state;
    console.log(toDos);
    if (!loadedToDos) {
      return <AppLoading />;
    }
    
    return (
        <ImageBackground source={this.currentImage} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>MS ToDo App</Text>
        
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={"Add new task here..."}
            value={newToDo}
            onChangeText={this._controlNewToDo}
            placeholderTextColor={"black"}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this._addToDo}
            underlineColorAndroid={"transparent"}
          />
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos)
              .sort((a, b) => {
                return a.createdAt - b.createdAt;
              })
              .map(toDo => (
                <ToDo
                  key={toDo.id}
                  deleteToDo={this._deleteToDo}
                  uncompleteToDo={this._uncompleteToDo}
                  completeToDo={this._completeToDo}
                  updateToDo={this._updateToDo}
                  {...toDo}
                />
              ))}
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }
  _controlNewToDo = text => {
    this.setState({
      newToDo: text
    });
  };
  _loadedToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem("toDos");
      const parsedToDos = JSON.parse(toDos);
      this.setState({ loadedToDos: true, toDos: parsedToDos || {} });
    } catch (err) {
      console.log(err);
    }
  };
  _addToDo = () => {
    const { newToDo, toDos } = this.state;
    if (newToDo !== "") {
      this.setState(prevState => {
        const ID = Math.floor((Math.random() * 10000) / 3.29);
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createdAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newToDo: "",
          toDos: {
            ...newToDoObject,
            ...prevState.toDos
          }
        };
        this._saveToDo(newState.toDos);
        return { ...newState };
      });
    }
  };
  _deleteToDo = id => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDo(newState.toDos);
      return { ...newState };
    });
  };

  _uncompleteToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      };
      this._saveToDo(newState.toDos);
      return { ...newState };
    });
  };
  _completeToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      };
      this._saveToDo(newState.toDos);
      return { ...newState };
    });
  };
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDo(newState.toDos);
      return { ...newState };
    });
  };
  _saveToDo = newToDos => {
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  title: {
    color: "white",
    fontSize: 25,
    marginTop: 30,
    fontWeight: "200",
    marginBottom: 20
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, .75)',
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom:50,
    marginTop:20,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(255, 255, 255)",
        shadowOpacity: 0.95,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0
        }
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: "black",
    borderBottomWidth: 1,
    fontSize: 25
  },
  toDos: {
    alignItems: "center"
  }
});
