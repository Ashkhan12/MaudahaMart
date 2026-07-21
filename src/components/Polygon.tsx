/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { GoogleMapsContext } from '@vis.gl/react-google-maps';

export interface PolygonProps extends google.maps.PolygonOptions {
  paths: { lat: number; lng: number }[];
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

export const Polygon = forwardRef((props: PolygonProps, ref: any) => {
  const { paths, onClick, ...polygonOptions } = props;
  const mapContext = useContext(GoogleMapsContext);
  const map = mapContext?.map;

  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;

    const poly = new google.maps.Polygon({
      ...polygonOptions,
      paths: paths,
    });
    poly.setMap(map);
    polygonRef.current = poly;

    let listener: google.maps.MapsEventListener | null = null;
    if (onClick) {
      listener = google.maps.event.addListener(poly, 'click', onClick);
    }

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
      poly.setMap(null);
      polygonRef.current = null;
    };
  }, [map, JSON.stringify(paths)]);

  // Dynamically update polygon options when they change
  useEffect(() => {
    if (polygonRef.current) {
      polygonRef.current.setOptions(polygonOptions);
    }
  }, [JSON.stringify(polygonOptions)]);

  useImperativeHandle(ref, () => polygonRef.current);

  return null;
});

export default Polygon;
