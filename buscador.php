<?php
header('Content-Type: application/json; charset=utf-8');

$archivo = file_get_contents('data-1.json');
$datos = json_decode($archivo, true);

if (!is_array($datos)) {
    echo json_encode([]);
    exit;
}

// Requerimiento 1: Botón "Mostrar Todos"
if (isset($_POST['todos']) && $_POST['todos'] === 'true') {
    echo json_encode($datos);
    exit;
}

// Requerimientos 3, 4, 5 y 6: Búsqueda por rango de precio, ciudad y/o tipo
$ciudad = isset($_POST['ciudad']) ? trim($_POST['ciudad']) : '';
$tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : '';
$precioRango = isset($_POST['precio']) ? $_POST['precio'] : '0;100000';

// El slider envía los valores como "min;max" (ej. "200;80000")
$limites = explode(';', $precioRango);
$precioMin = isset($limites[0]) ? (float)$limites[0] : 0;
$precioMax = isset($limites[1]) ? (float)$limites[1] : 100000;

$resultados = [];

foreach ($datos as $propiedad) {
    // Convertimos "$30,746" en el número 30746
    $precioNumerico = (float)str_replace(['$', ','], '', $propiedad['Precio']);

    $cumplePrecio = ($precioNumerico >= $precioMin && $precioNumerico <= $precioMax);
    $cumpleCiudad = ($ciudad === '' || $propiedad['Ciudad'] === $ciudad);
    $cumpleTipo = ($tipo === '' || $propiedad['Tipo'] === $tipo);

    if ($cumplePrecio && $cumpleCiudad && $cumpleTipo) {
        $resultados[] = $propiedad;
    }
}

echo json_encode($resultados);
?>