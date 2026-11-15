<?php
header('Content-Type: application/json; charset=utf-8');

$archivo = file_get_contents('data-1.json');
$datos = json_decode($archivo, true);

$ciudades = [];
$tipos = [];

if (is_array($datos)) {
    foreach ($datos as $propiedad) {
        if (!empty($propiedad['Ciudad']) && !in_array($propiedad['Ciudad'], $ciudades)) {
            $ciudades[] = $propiedad['Ciudad'];
        }
        if (!empty($propiedad['Tipo']) && !in_array($propiedad['Tipo'], $tipos)) {
            $tipos[] = $propiedad['Tipo'];
        }
    }
}

sort($ciudades);
sort($tipos);

echo json_encode([
    'ciudades' => $ciudades,
    'tipos' => $tipos
]);
?>