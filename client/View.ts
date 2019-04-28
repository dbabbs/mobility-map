/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { Theme } from "@here/harp-datasource-protocol";
import { MapControls } from "@here/harp-map-controls";
import { CopyrightElementHandler, MapView } from "@here/harp-mapview";
import { APIFormat, OmvDataSource } from "@here/harp-omv-datasource";
// import geojson from "./italy.json";

import { GeoJsonDataProvider } from "@here/harp-geojson-datasource";

// console.log(geojson)

const defaultTheme = "resources/berlin_tilezen_night_reduced.json";


export interface ViewParameters {
   theme?: string | Theme;
   canvas: HTMLCanvasElement;
}

export class View {
   readonly canvas: HTMLCanvasElement;
   readonly theme: string | Theme;

   readonly mapView: MapView;

   constructor(args: ViewParameters) {
      this.canvas = args.canvas;
      this.theme = args.theme === undefined ? defaultTheme : args.theme;
      this.mapView = this.initialize();
   }

   protected initialize(): MapView {
      const mapView = new MapView({
         canvas: this.canvas,
         theme: this.theme,
         decoderUrl: "decoder.bundle.js"
      });





      CopyrightElementHandler.install("copyrightNotice")
         .attach(mapView)
         .setDefaults([
            {
               id: "here.com",
               label: "HERE",
               link: "https://legal.here.com/terms",
               year: 2019
            }
         ]);

      const omvDataSource = new OmvDataSource({
         baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
         apiFormat: APIFormat.XYZOMV,
         styleSetName: "tilezen",
         maxZoomLevel: 17,
         authenticationCode: "Ad0mrK7Ib-rFgjU4hZmp-UI"
      });
      mapView.addDataSource(omvDataSource);

      MapControls.create(mapView);


      const geoJsonDataProvider = new GeoJsonDataProvider(
         "italy",
         new URL("resources/italy.json", window.location.href)
      );
      console.log(geoJsonDataProvider)

      const geoJsonDataSource = new OmvDataSource({
         dataProvider: geoJsonDataProvider,
         name: "geojson",
         styleSetName: "geojson"
      });
      console.log(geoJsonDataSource)
      mapView.addDataSource(geoJsonDataSource);
      mapView.update();


      console.log(
         mapView.getDataSourcesByStyleSetName()
      )

      return mapView;
   }


}
