<GL.Scene>
  <GL.AmbientLight intensity={.5}/>
  <GL.OrbitControls location={[0,0, 500]} let:location let:target>
    <GL.PointLight intensity={.5} {location} />
    <GL.PerspectiveCamera far={1000} lookAt={target} {location}/>
  </GL.OrbitControls>

  <GL.Mesh
    geometry={car()}
    uniforms={{ color: 0xff0000 }}
  />
</GL.Scene>
<script>
  import * as GL from '@sveltejs/gl';
  import car from './models/car'

  function createCar(carColor, fallbackColor, useFallbackColor, bus) {
    var color = carColor;
    if (useFallbackColor) {
      color = fallbackColor;
    }
    var res = new THREE.Group();
    var normal = new THREE.Vector3(0, 1, 0),
      ocol = new THREE.Color(color),
      bcol = new THREE.Color(0);
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(100, -100, 100),
      new THREE.Vector3(100, 100, 100),
      new THREE.Vector3(-100, 100, 100),
      new THREE.Vector3(-100, -100, 100),

      new THREE.Vector3(150, -220, 20),
      new THREE.Vector3(-150, -220, 20),
      new THREE.Vector3(130, -400, -20),
      new THREE.Vector3(-130, -400, -20),

      new THREE.Vector3(140, 170, 25),
      new THREE.Vector3(-140, 170, 25),
      new THREE.Vector3(130, 240, 25),
      new THREE.Vector3(-130, 240, 25),

      new THREE.Vector3(130, -400, -80),
      new THREE.Vector3(-130, -400, -80),
      new THREE.Vector3(150, -220, -80),
      new THREE.Vector3(-150, -220, -80),

      new THREE.Vector3(140, 170, -80),
      new THREE.Vector3(-140, 170, -80),
      new THREE.Vector3(130, 240, -80),
      new THREE.Vector3(-130, 240, -80)
    );
    geometry.faces.push(
      new THREE.Face3(0, 1, 2, normal, ocol),
      new THREE.Face3(0, 2, 3, normal, ocol),
      new THREE.Face3(4, 0, 5, normal, bcol),
      new THREE.Face3(0, 3, 5, normal, bcol),
      new THREE.Face3(6, 4, 5, normal, ocol),
      new THREE.Face3(6, 5, 7, normal, ocol),
      new THREE.Face3(1, 8, 9, normal, bcol),
      new THREE.Face3(1, 9, 2, normal, bcol),
      new THREE.Face3(4, 8, 1, normal, bcol),
      new THREE.Face3(4, 1, 0, normal, bcol),
      new THREE.Face3(3, 2, 9, normal, bcol),
      new THREE.Face3(3, 9, 5, normal, bcol),
      new THREE.Face3(8, 10, 11, normal, ocol),
      new THREE.Face3(8, 11, 9, normal, ocol),
      new THREE.Face3(12, 6, 7, normal, ocol),
      new THREE.Face3(12, 7, 13, normal, ocol),
      new THREE.Face3(7, 5, 15, normal, ocol),
      new THREE.Face3(7, 15, 13, normal, ocol),
      new THREE.Face3(6, 14, 4, normal, ocol),
      new THREE.Face3(12, 14, 6, normal, ocol),
      new THREE.Face3(14, 16, 4, normal, ocol),
      new THREE.Face3(4, 16, 8, normal, ocol),
      new THREE.Face3(5, 9, 15, normal, ocol),
      new THREE.Face3(15, 9, 17, normal, ocol),
      new THREE.Face3(16, 18, 8, normal, ocol),
      new THREE.Face3(8, 18, 10, normal, ocol),
      new THREE.Face3(9, 11, 17, normal, ocol),
      new THREE.Face3(17, 11, 19, normal, ocol),
      new THREE.Face3(10, 18, 11, normal, ocol),
      new THREE.Face3(11, 18, 19, normal, ocol),
      new THREE.Face3(14, 12, 13, normal, ocol),
      new THREE.Face3(14, 13, 15, normal, ocol),
      new THREE.Face3(16, 14, 15, normal, ocol),
      new THREE.Face3(16, 15, 17, normal, ocol),
      new THREE.Face3(18, 16, 17, normal, ocol),
      new THREE.Face3(18, 17, 19, normal, ocol)
    );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    bus.on("setting.cars.colors.simple", function (value) {
      var color = carColor;
      if (value) {
        color = fallbackColor;
      }
      for (var i = 0; i < geometry.faces.length; i++) {
        var face = geometry.faces[i];
        if (face.color == ocol) {
          face.color.set(color);
        }
      }
      geometry.colorsNeedUpdate = true;
      bus.fireLater("update");
    });
    var bodyMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({
        color: 16777215,
        vertexColors: THREE.FaceColors,
      })
    );
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = false;
    res.add(bodyMesh);
    var wheelMat = new THREE.MeshLambertMaterial({ color: 0 });
    function newWheel(x, y, z, w) {
      var wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(70, 70, w, 10),
        wheelMat
      );
      wheel.rotateZ(Math.PI / 2);
      wheel.position.set(x, y, z);
      return wheel;
    }
    res.add(newWheel(120, -300, -60, 50));
    res.add(newWheel(-120, -300, -60, 50));
    res.add(newWheel(120, 150, -60, 70));
    res.add(newWheel(-120, 150, -60, 70));
    var material = new THREE.MeshBasicMaterial({ map: lensMap });
    material.transparent = true;
    material.blending = THREE.NormalBlending;
    var spriteMaterial = new THREE.SpriteMaterial({
      map: lensMap,
      color: 16777215,
    });
    var boostIndicator = new THREE.Sprite(spriteMaterial);
    boostIndicator.scale.set(2e3, 2e3, 1);
    boostIndicator.position.set(0, 500, 0);
    res.add(boostIndicator);
    res.position.set(0, 0, 50);
    res.rotateZ(Math.PI / 2);
    var sc = 0.35;
    res.scale.set(sc, sc, sc);
    var res2 = new THREE.Group();
    res2.add(res);
    return { model: res2, boostIndicator: boostIndicator };
  }
</script>