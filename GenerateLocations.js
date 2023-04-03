import { useMyComponentContext } from "../../Providers/ComponentProvider";
import { useMyDataContext } from "../../Providers/DataProvider";
import {
  Button,
  Menu,
  Popup,
  ScrollView,
  SelectBox,
  CheckBox,
} from "devextreme-react";
import TreeList, {
  Column,
  Scrolling,
  SearchPanel,
  Selection,
} from "devextreme-react/tree-list";
import { basicFetch, createDevice } from "../../Neutrum/neutrumAPI";
import { useState, useEffect } from "react";
import { showMessage } from "../../const";
import { post } from "@okta/okta-auth-js";

export const GenerateLocations = () => {
  const [componentsState] = useMyComponentContext();
  const [popUpGenLoc, setPopUpGenLoc] = componentsState.popUpGenLoc;
  const [dataState] = useMyDataContext();
  const [modelRooms, setModelRooms] = dataState.modelRooms;
  const [tmodelRooms, setTmodelRooms] = useState([]);
  const [modelFloors, setModelFloors] = dataState.modelFloors;
  const [misCountries, setMisCountries] = useState([]);
  const [misCities, setMisCities] = useState([]);
  const [misGeolocations, setMisGeolocations] = useState([]);
  const [todasMisCities, setTodasMisCities] = useState([]);
  const [todasMisGeolocations, setTodasMisGeolocations] = useState([]);
  const [selectedGeolocation, setSelectedGeolocation] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState(null);
  const [allLevels, setAllLevels] = useState(true);
  const [roomsPorFloor, setRoomsPorFloor] = useState(null);
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState(null);
  const [popUpExistingLocs, setPopUpExistingLocs] = useState(null);
  const [locationsExistentes, setLocationsExistentes] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!selectedGeolocation || selectedRooms.length === 0) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [selectedGeolocation, selectedRooms]);

  const togglePopupGenLoc = () => {
    setPopUpGenLoc(false);
    setMisCountries([]);
    setMisCities([]);
    setMisGeolocations([]);
    setTodasMisCities([]);
    setTodasMisGeolocations([]);
    setAllLevels(true);
    setRoomsPorFloor(null);
    setColumnasSeleccionadas(null);
    setPopUpExistingLocs(null);
    setTmodelRooms([]);
  };

  const url = sessionStorage.getItem("serverNeutrum");

  async function MyPost(buildingLoc) {
    const formData = new FormData();
    formData.append("picture", null);
    formData.append("drawing", null);

    formData.append(
      "json",
      new Blob([JSON.stringify(buildingLoc)], {
        type: "application/json",
      })
    );
    //console.log(formData.get("json"), JSON.stringify(buildingLoc));

    const response = await createDevice(`${url}/locations`, {
      updatedContent: formData,
    });

    return response;
  }

  const onGenLocShow = async () => {
    //SACAMOS TODAS LAS LOC
    let tLocationsExistentes;
    await basicFetch(`${url}/locationsLite`, {}).then((res) => {
      tLocationsExistentes = res.body;
    });
    //console.log(tLocationsExistentes);
    setLocationsExistentes(tLocationsExistentes);
    //SACAMOS TODOS LOS PAÍSES
    let tCountries;
    await basicFetch(`${url}/countries`, {}).then((res) => {
      tCountries = res.body;
    });
    //console.log(tCountries);
    setMisCountries(tCountries.countries);

    //SACAMOS TODAS LAS CIUDADES
    let tCities;
    await basicFetch(`${url}/cities`, {}).then((res) => {
      tCities = res.body;
    });
    //console.log(tCities);
    setMisCities(tCities.cities);
    setTodasMisCities(tCities.cities);

    //SACAMOS TODAS LAS GEOLOCATIONS
    let tGeolocations;
    await basicFetch(`${url}/geolocations`, {}).then((res) => {
      tGeolocations = res.body;
    });
    //console.log(tGeolocations);
    setMisGeolocations(tGeolocations.geolocations);
    setTodasMisGeolocations(tGeolocations.geolocations);

    //SACAMOS TODAS LAS ROOMS PARA CREAR LOCATIONS ASOCIADAS
    const tmodelRooms = [];
    modelRooms.forEach((e) => {
      tmodelRooms.push({
        nombre: e.bl_id + ";" + e.fl_id + ";" + e.rm_id,
        id: e.dbId,
        fl: e.fl_id,
        bl: e.bl_id,
      });
    });
    //console.log(tmodelRooms);
    setTmodelRooms(tmodelRooms);
    const roomsPorFloor = [];

    tmodelRooms.forEach((room) => {
      const fl = room.fl;
      const index = roomsPorFloor.findIndex((item) => item.level === fl);

      if (index === -1) {
        roomsPorFloor.push({
          level: fl,
          rooms: [room.nombre],
        });
      } else {
        roomsPorFloor[index].rooms.push(room.nombre);
      }
    });

    setRoomsPorFloor(roomsPorFloor);
    setSelectedRooms(roomsPorFloor);

    //console.log(roomsPorFloor);

    const columnasSeleccionadas = [
      "All levels",
      ...roomsPorFloor.map((room) => room.level),
    ];
    //console.log(columnasSeleccionadas);
    setColumnasSeleccionadas(columnasSeleccionadas);
  };

  const onSelection = (e) => {
    const tSelectedRooms = roomsPorFloor.filter((room) =>
      e.includes(room.level)
    );
    setSelectedRooms(tSelectedRooms);
  };

  const onCountryChange = (e) => {
    let tmisCities = todasMisCities.filter(
      (city) => city.ctryId === e?.selectedItem?.ctryId
    );

    setMisCities(tmisCities);
  };

  const onCityChange = (e) => {
    let tmisGeolocations = todasMisGeolocations.filter(
      (geolocation) => geolocation.cityId === e?.selectedItem?.cityId
    );
    setMisGeolocations(tmisGeolocations);
  };

  const onGeoLocChange = (e) => {
    setSelectedGeolocation(e?.selectedItem);
    console.log(e?.selectedItem);
  };

  const onLevelsChange = (e) => {
    setAllLevels(e.value);
  };

  const handleExistingLocs = () => {
    setPopUpExistingLocs(true);
  };

  const togglePopupExistingLocs = () => {
    setPopUpExistingLocs(false);
  };

  async function handleCreateLocations() {
    let locationsActuales = locationsExistentes;
    const currentDate = new Date();
    const newLoc = {
      geolocationId: 0,
      description: "",
      name: "",
      openDate: currentDate.toISOString(),
      closeDate: null,
      latitude: 0,
      longitude: 0,
      area: 0,
      allowedCapacity: null,
      capacity: 0,
      occupiable: true,
      occupantCount: null,
      plannedOccupancy: null,
      category: "",
      subcategory: "",
      standard: "",
      openingHourStart: null,
      openingHourEnd: null,
      breakHour: null,
      bussinessDays: [],
      status: "IN",
      type: "",
      drawing: null,
      picture: null,
      isInventoryLocation: false,
      isMobile: false,
    };

    const locationsCreadas = [];

    const buildingLoc = {
      ...newLoc,
      name: tmodelRooms[0].bl,
      locationType: "BUILDING",
      locationLevel: 0,
      geolocationId: selectedGeolocation.geolocationId,
    };
    locationsCreadas.push(buildingLoc);
    console.log(buildingLoc);

    //COMPROBAMOS SI YA EXISTE UNA LOCATION DEL BUILDING
    const buildingExisteBien = locationsActuales.locations.filter(
      (location) =>
        location.name == buildingLoc.name &&
        location.locationType === buildingLoc.locationType &&
        location.geolocationId === buildingLoc.geolocationId
    );
    const buildingExisteMal = locationsActuales.locations.filter(
      (location) =>
        location.name == buildingLoc.name &&
        !(location.locationType === buildingLoc.locationType)
    );

    console.log(buildingExisteBien);
    console.log(buildingExisteMal);

    //CASO INTERMEDIO: BUILDING YA EXISTE
    if (buildingExisteBien.length > 0) {
      console.log("Caso 1: el Building", buildingExisteBien, "ya existe");
      //    showMessage(
      //       "WARNING",
      //       `The building location is already in the DataBase with type Building. The locations will be created.`
      //    );
    }
    //CASO PEOR: LOCATION EXISTE PERO NO ES BUILDING
    else if (buildingExisteMal.length > 0) {
      console.log(
        "Caso 2: ERROR: La location existe pero no asignada a building"
      );
      showMessage(
        "error",
        `ERROR: The building location is already in the DataBase, but not with type Building. The locations will not be created.`
      );
      return 0;
    }
    //CASO MEJOR: NO EXISTE NINGUNA LOCATION ASOCIADA
    else {
      console.log("Caso 3: Building no tiene locations, lo creamos normal");
    }

    let response;
    if (buildingExisteBien.length === 0) {
      response = await MyPost(buildingLoc);
      if (response.status === 200) {
        locationsActuales.locations = [
          ...locationsActuales.locations,
          response.data,
        ];
      }
    }

    let parentFloor;
    if (buildingExisteBien.length > 0) {
      parentFloor = buildingExisteBien[0].locationId;
    } else {
      parentFloor = response.data.locationId;
    }

    //CREAMOS FLOORS Y ROOMS:
    for (let level of selectedRooms) {
      const newLocationFloor = {
        ...newLoc,
        locationLevel: 1,
        locationType: "FLOOR",
        name: `${tmodelRooms[0].bl}-${level.level}`,
        geolocationId: selectedGeolocation.geolocationId,
        parentLocationId: parentFloor,
      };
      locationsCreadas.push(newLocationFloor);

      //COMPTOBAMOS QUE NO EXISTEN LOS FLOORS DEFINIDOS
      const floorsExistenBien = locationsActuales.locations.filter(
        (location) =>
          location.name === newLocationFloor.name &&
          location.locationType === newLocationFloor.locationType &&
          location.parentLocationId === newLocationFloor.parentLocationId
      );

      const floorsExistenMal = locationsActuales.locations.filter(
        (location) =>
          location.name.includes(newLocationFloor.name) &&
          (!(location.locationType === newLocationFloor.locationType) ||
            !(location.parentLocationId === newLocationFloor.parentLocationId))
      );

      console.log("floorsExistenBien", floorsExistenBien);
      console.log("floorsExistenMal", floorsExistenMal);
      //CASO 1: NO EXISTEN FLOORS DEFINIDOS
      let response;
      let parentRoom = null;
      if (floorsExistenBien.length === 0 && floorsExistenMal.length === 0) {
        console.log("Caso 1: No existen floors definidos.");
        response = await MyPost(newLocationFloor);
        if (response.status === 200) {
          locationsActuales.locations = [
            ...locationsActuales.locations,
            response.data,
          ];
        }

        console.log(response.data);
        parentRoom = response.data.locationId;
        //crea floors
      }

      //CASO 2: EXISTE FLOOR BIEN DEFINIDO Y ADEMÁS COINCIDE TODO
      else if (floorsExistenBien.length > 0) {
        console.log(
          "Caso 2: el Floor",
          newLocationFloor,
          "ya existe pero todo bien"
        );
        parentRoom = floorsExistenBien[0].locationId;
        console.log("yaexistenfloors");
        //crear floors
      }
      //CASO 3: EXISTE FLOOR MAL DEFINIDO
      else if (floorsExistenMal.length > 0) {
        console.log(
          "Caso 3: el Floor",
          newLocationFloor,
          "ya existe pero todo mal"
        );
        showMessage(
          "error",
          `ERROR: The building location is already in the DataBase, but not with type Building. The locations will not be created.`
        );
        continue;
      }
      if (parentRoom != null) {
        level.rooms.forEach(async (room) => {
          const newLocationRoom = {
            ...newLoc,
            label: room,
            name: room.replace(/;/g, "-"),
            locationLevel: 2,
            geolocationId: selectedGeolocation.geolocationId,
            parentLocationId: parentRoom,
            locationType: "FACILITY",
          };
          locationsCreadas.push(newLocationRoom);
          //comprobar si existe antes de crear con un IF
          if (
            !locationsActuales.locations.filter(
              (loc) => loc.name === newLocationRoom.name
            )[0]
          ) {
            response = await MyPost(newLocationRoom);
            if (response.status === 200) {
              locationsActuales.locations = [
                ...locationsActuales.locations,
                response.data,
              ];
            }
          }
        });
      }
    }
    console.log(locationsCreadas);
    showMessage("success", `Process terminated successfully`);
    /*
    //AQUÍ METER PROGRESS BAR
    showMessage("success", `Locations created successfully`);
    return 0;
    */
    setLocationsExistentes(locationsActuales);
  }

  function renderContentExistingLocs() {
    return (
      <>
        <p>
          There are already locations created in the floors you have selected.
          <br></br>
          Are you sure you want to skip them?
        </p>
        <Button
          text="Create Location"
          onClick={() => handleCreateLocations()}
        />
        <Button text="Cancel" onClick={() => setPopUpExistingLocs(false)} />
      </>
    );
  }

  function renderContent() {
    const onCancelClick = () => {
      setMisCountries([]);
      setMisCities([]);
      setMisGeolocations([]);
      togglePopupGenLoc();
    };
    const onCreateClick = async () => {
      //console.log("Selected Country: ", misCountries);
      //console.log("Selected City: ", misCities);
      //console.log("Selected Geolocation: ", misGeolocations);
      //console.log(columnasSeleccionadas);
      //console.log(roomsPorFloor);

      const labelList = [];
      selectedRooms.forEach((room) => {
        labelList.push(room.rooms);
      });
      //console.log(labelList);

      //AHORA QUIERO VER SI HAY LOCATIONS ASOCIADAS A ESTAS ROOMS

      let existe = false;

      selectedRooms.forEach((level) => {
        level.rooms.forEach((room) => {
          const matchingLocation = locationsExistentes.locations.find(
            (location) => location.label === room
          );
          if (matchingLocation) {
            existe = true;
          }
        });
      });
      if (existe) {
        console.log(`El nivel tiene localizaciones que ya existen.`);
        showMessage(
          "warning",
          `There are localizations in level that already exist`
        );
        handleExistingLocs();
      } else {
        console.log("Todo bien");
        handleCreateLocations();
      }
    };

    const disableGeolocations = misCities.length !== 1;
    return (
      <>
        <ScrollView>
          <SelectBox
            dataSource={misCountries}
            width="auto"
            displayExpr="name"
            valueExpr="name"
            showClearButton={true}
            searchEnabled={true}
            onSelectionChanged={(e) => onCountryChange(e)}
            placeholder="Country"
          />
          <SelectBox
            dataSource={misCities}
            width="auto"
            displayExpr="name"
            valueExpr="name"
            showClearButton={true}
            searchEnabled={true}
            onSelectionChanged={(e) => onCityChange(e)}
            placeholder="City"
          />
          <SelectBox
            dataSource={misGeolocations}
            width="auto"
            displayExpr="name"
            valueExpr="name"
            showClearButton={true}
            searchEnabled={true}
            onSelectionChanged={(e) => onGeoLocChange(e)}
            //disabled={disableGeolocations}
            placeholder="Geolocation"
          />

          <TreeList
            id="roomsPorFloor"
            dataSource={roomsPorFloor}
            keyExpr="level"
            selectedRowKeys={columnasSeleccionadas}
            onSelectedRowKeysChange={(e) => onSelection(e)}
          >
            <Selection mode="multiple" />
            <Column dataField="level" caption="All levels" />
          </TreeList>
        </ScrollView>
        <div className="popup-buttons-container">
          <Button text="Cancel" onClick={() => onCancelClick()} />
          <Button
            text="Create"
            onClick={() => onCreateClick()}
            type="default"
            className="dx-button-create"
            disabled={disabled}
          />
        </div>
      </>
    );
  }

  return (
    <div>
      <Popup
        visible={popUpGenLoc}
        onShowing={onGenLocShow}
        onHiding={togglePopupGenLoc}
        showTitle={true}
        title="Generate Locations"
        width="auto"
        minWidth="30%"
        maxWidth="30%"
        minHeight="30%"
        height="auto"
        position="right"
        resizeEnabled={true}
        hideOnOutsideClick={false}
        backdropCloseable={false}
        dragEnabled={true}
        closeOnOutsideClick={false}
        shading={false}
        contentRender={renderContent}
      ></Popup>
      <Popup
        visible={popUpExistingLocs}
        onHiding={togglePopupExistingLocs}
        showTitle={true}
        title="Confirm"
        width={380}
        height={250}
        position="right"
        resizeEnabled={true}
        hideOnOutsideClick={false}
        backdropCloseable={false}
        dragEnabled={true}
        closeOnOutsideClick={false}
        shading={false}
        contentRender={renderContentExistingLocs}
      ></Popup>
    </div>
  );
};
