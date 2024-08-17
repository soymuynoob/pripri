import { QueryTypes, WhereOptions } from 'sequelize'
import { DataBase } from '../../../../database/index'

export const findUserWhereService = async ({
  where
}: {
  where: WhereOptions<any>
}) => {
  try {
    return await DataBase.instance.user.findOne({
      where,
    })
  } catch (err) {
    throw err
  }
}



export const getUserService = async ({
  page,
  limit,
  order,
  search,
  rol
}: {
  page: number;
  limit: number;
  order: string;
  search: string;
  rol: number;
}) => {
  try {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    let whereClause = 'WHERE 1=1';
    const replacements: any = {
      limit,
      offset
    };

    if (rol > 0) {
      whereClause += ' AND u.rol_id = :rol AND u.state = 1';
      replacements.rol = rol;
    }

    if (search && search.trim() !== '') {
      whereClause += `
        AND (
          u.name_p LIKE :search OR 
          u.name_s LIKE :search OR 
          u.lastname_m LIKE :search OR 
          u.lastname_p LIKE :search OR 
          u.number_document LIKE :search OR 
          u.email LIKE :search OR 
          u.number_phone_1 LIKE :search OR 
          u.number_phone_2 LIKE :search OR 
          u.address LIKE :search OR
          level.value LIKE :search
        )`;
      replacements.search = searchPattern;
    }

    const dataQuery = `
      SELECT 
        u.id, 
        u.name_p, 
        u.name_s, 
        u.lastname_m, 
        u.lastname_p, 
        u.number_document, 
        u.email, 
        u.number_phone_1, 
        u.number_phone_2, 
        u.address, 
        u.salary, 
        u.level_id, 
        level.value as level,
        rol.value as rol,
        u.rol_id,
        type_document.value as type_document, 
        gender.value as gender,
        u.state,
        u.code

      FROM user AS u
      INNER JOIN general_variables AS rol ON u.rol_id = rol.id_code
      INNER JOIN general_variables AS type_document ON u.type_document_id = type_document.id_code
      INNER JOIN general_variables AS gender ON u.gender_id = gender.id_code
      INNER JOIN general_variables as level ON u.level_id = level.id_code
      ${whereClause}
      ORDER BY u.created_date ${order}
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM user AS u
      INNER JOIN general_variables AS rol ON u.rol_id = rol.id_code
      INNER JOIN general_variables AS type_document ON u.type_document_id = type_document.id_code
      INNER JOIN general_variables AS gender ON u.gender_id = gender.id_code
      INNER JOIN general_variables as level ON u.level_id = level.id_code

      ${whereClause};
    `;

    const results = await DataBase.instance.sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
      logging: console.log
    });

    const countResult: any = await DataBase.instance.sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    const totalRecords = countResult[0].total;

    return {
      results,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page
    };
  } catch (err) {
    throw err;
  }
};



// Función para generar colores únicos
const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// export const reportUserMoneyService = async ({
//   dateInit,
//   dateEnd
// }: {
//   dateInit?: string; // Opcional
//   dateEnd?: string; // Opcional
// }) => {
//   try {
//     // Inicializar la cláusula WHERE para los filtros de fecha
//     let dateFilterForTicket = '';
//     let replacements: any = {};

//     if (dateInit && dateEnd) {
//       dateFilterForTicket = `AND DATE(t.date) BETWEEN :dateInit AND :dateEnd`;
//       replacements.dateInit = dateInit;
//       replacements.dateEnd = dateEnd;
//     }

//     // Consulta SQL para obtener los ingresos por técnico
//     const dataQuery = `
//       WITH Meses AS (
//           SELECT DISTINCT DATE_FORMAT(DATE_ADD(:start_date, INTERVAL seq MONTH), '%Y-%m') AS mes
//           FROM (
//               SELECT @rownum := @rownum + 1 AS seq
//               FROM (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t1,
//                    (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t2,
//                    (SELECT @rownum := -1) t0
//               WHERE @rownum < TIMESTAMPDIFF(MONTH, :start_date, :end_date)
//           ) AS meses_generados
//       ),
//       IngresosPorMes AS (
//           SELECT
//               CONCAT(u.name_p, ' ', u.lastname_p) AS nombre_completo,
//               DATE_FORMAT(t.date, '%Y-%m') AS mes,
//               SUM(CAST(t.amount AS DECIMAL(10, 2))) AS ingreso_mensual
//           FROM
//               user u
//           JOIN
//               general_variables gv ON u.rol_id = gv.id_code
//           LEFT JOIN
//               ticket t ON u.id = t.technical_id
//           JOIN
//               general_variables gv_status ON t.service_status_id = gv_status.id_code
//           WHERE
//               gv.value = 'Tecnico'
//               AND gv_status.value = 'REALIZADO CON PAGO'
//               AND DATE(t.date) BETWEEN :start_date AND :end_date
//           GROUP BY
//               u.id, nombre_completo, mes
//       )
//       SELECT
//           nombre_completo,
//           GROUP_CONCAT(COALESCE(ingreso_mensual, 0) ORDER BY m.mes SEPARATOR ',') AS ingresos,
//           GROUP_CONCAT(m.mes ORDER BY m.mes SEPARATOR ',') AS meses
//       FROM
//           (SELECT DISTINCT nombre_completo FROM IngresosPorMes) u
//       CROSS JOIN
//           Meses m
//       LEFT JOIN
//           IngresosPorMes i ON u.nombre_completo = i.nombre_completo AND m.mes = i.mes
//       GROUP BY
//           u.nombre_completo
//       ORDER BY
//           u.nombre_completo;
//     `;

//     const results = await DataBase.instance.sequelize.query(dataQuery, {
//       replacements: {
//         ...replacements,
//         start_date: dateInit || '2024-01-01',
//         end_date: dateEnd || '2024-12-31'
//       },
//       type: QueryTypes.SELECT,
//     });

//     // Obtener un color único para cada usuario
//     const userColors: { [key: string]: string } = {};
//     const colorPalette = [
//       'rgba(255, 99, 132, 0.2)',
//       'rgba(54, 162, 235, 0.2)',
//       'rgba(75, 192, 192, 0.2)',
//       'rgba(153, 102, 255, 0.2)',
//       'rgba(255, 159, 64, 0.2)',
//       // Puedes agregar más colores si es necesario
//     ];

//     // Función para obtener un color único o generar uno aleatorio si se acaba la paleta
//     const getUniqueColor = (index: number) => {
//       return colorPalette[index % colorPalette.length] || generateRandomColor();
//     };

//     // Procesar resultados para el formato requerido
//     const processedResults = results.map((row: any, index: number) => {
//       // Asignar un color único para cada usuario
//       const color = getUniqueColor(index);
//       return {
//         label: row.nombre_completo,
//         data: row.ingresos.split(',').map(Number), // Convertir los ingresos a números
//         backgroundColor: color,
//         borderColor: color.replace('0.2', '1'), // Cambiar la opacidad del color de fondo para el borde
//         borderWidth: 1
//       };
//     });

//     return processedResults;
//   } catch (err) {
//     console.log(err);

//     throw err;
//   }
// };
  // const dataQuery = `
    //   WITH Meses AS (
    //       SELECT DISTINCT DATE_FORMAT(DATE_ADD(:start_date, INTERVAL seq MONTH), '%Y-%m') AS mes
    //       FROM (
    //           SELECT @rownum := @rownum + 1 AS seq
    //           FROM (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t1,
    //                (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t2,
    //                (SELECT @rownum := -1) t0
    //           WHERE @rownum < TIMESTAMPDIFF(MONTH, :start_date, :end_date)
    //       ) AS meses_generados
    //   ),
    //   IngresosPorMes AS (
    //       SELECT
    //           u.id AS usuario_id,
    //           CONCAT(u.name_p, ' ', u.lastname_p) AS nombre_completo,
    //           DATE_FORMAT(t.date, '%Y-%m') AS mes,
    //           SUM(CAST(t.amount AS DECIMAL(10, 2))) AS ingreso_mensual
    //       FROM
    //           user u
    //       JOIN
    //           general_variables gv ON u.rol_id = gv.id_code
    //       LEFT JOIN
    //           ticket t ON u.id = t.technical_id
    //       JOIN
    //           general_variables gv_status ON t.service_status_id = gv_status.id_code
    //       WHERE
    //           gv.value = 'Tecnico'
    //           AND gv_status.value = 'REALIZADO CON PAGO'
    //           AND DATE(t.date) BETWEEN :start_date AND :end_date
    //       GROUP BY
    //           u.id, nombre_completo, mes
    //   )
    //   SELECT
    //       i.nombre_completo,
    //       GROUP_CONCAT(COALESCE(i.ingreso_mensual, 0) ORDER BY m.mes SEPARATOR ',') AS ingresos,
    //       GROUP_CONCAT(m.mes ORDER BY m.mes SEPARATOR ',') AS meses
    //   FROM
    //       (SELECT DISTINCT nombre_completo FROM IngresosPorMes) u
    //   CROSS JOIN
    //       Meses m
    //   LEFT JOIN
    //       IngresosPorMes i ON u.nombre_completo = i.nombre_completo AND m.mes = i.mes
    //   GROUP BY
    //       i.nombre_completo
    //   ORDER BY
    //       i.nombre_completo;
    // `;
export const reportUserMoneyService = async ({
  dateInit,
  dateEnd
}: {
  dateInit?: string; // Opcional
  dateEnd?: string; // Opcional
}) => {
  try {
    // Configurar fechas por defecto si no se proporcionan
    const startDate = dateInit || '2024-01-01';
    const endDate = dateEnd || '2024-12-31';

    // Consulta SQL para obtener los ingresos por técnico
  
    const dataQuery = `
WITH Meses AS (
    SELECT DISTINCT DATE_FORMAT(DATE_ADD(:start_date, INTERVAL seq MONTH), '%Y-%m') AS mes
    FROM (
        SELECT @rownum := @rownum + 1 AS seq
        FROM (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t1,
             (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t2,
             (SELECT @rownum := -1) t0
        WHERE @rownum < TIMESTAMPDIFF(MONTH, :start_date, :end_date)
    ) AS meses_generados
),
Usuarios AS (
    SELECT DISTINCT
        u.id AS usuario_id,
        CONCAT(u.name_p, ' ', u.lastname_p) AS nombre_completo
    FROM
        user u
    JOIN
        general_variables gv ON u.rol_id = gv.id_code
    WHERE
        gv.value = 'Tecnico'
),
IngresosPorMes AS (
    SELECT
        u.id AS usuario_id,
        CONCAT(u.name_p, ' ', u.lastname_p) AS nombre_completo,
        DATE_FORMAT(t.date, '%Y-%m') AS mes,
        SUM(CAST(t.amount AS DECIMAL(10, 2))) AS ingreso_mensual
    FROM
        user u
    JOIN
        general_variables gv ON u.rol_id = gv.id_code
    LEFT JOIN
        ticket t ON u.id = t.technical_id
    JOIN
        general_variables gv_status ON t.service_status_id = gv_status.id_code
    WHERE
        gv.value = 'Tecnico'
        AND gv_status.value = 'REALIZADO CON PAGO'
        AND DATE(t.date) BETWEEN :start_date AND :end_date
    GROUP BY
        u.id, nombre_completo, mes
)
SELECT
    u.nombre_completo,
    GROUP_CONCAT(COALESCE(i.ingreso_mensual, 0) ORDER BY m.mes SEPARATOR ',') AS ingresos,
    GROUP_CONCAT(m.mes ORDER BY m.mes SEPARATOR ',') AS meses
FROM
    Usuarios u
CROSS JOIN
    Meses m
LEFT JOIN
    IngresosPorMes i ON u.usuario_id = i.usuario_id AND m.mes = i.mes
GROUP BY
    u.nombre_completo
ORDER BY
    u.nombre_completo;
`
    const results = await DataBase.instance.sequelize.query(dataQuery, {
      replacements: {
        start_date: startDate,
        end_date: endDate
      },
      type: QueryTypes.SELECT,
    });

    // Obtener un color único para cada usuario
    const userColors: { [key: string]: string } = {};
    const colorPalette = [
      'rgba(255, 99, 132, 1)', // Rojo
      'rgba(54, 162, 235, 1)', // Azul
      'rgba(75, 192, 192, 1)', // Verde agua
      'rgba(153, 102, 255, 1)', // Lila
      'rgba(255, 159, 64, 1)', // Naranja
      // Puedes agregar más colores si es necesario
    ];
    

    // Función para obtener un color único o generar uno aleatorio si se acaba la paleta
    const getUniqueColor = (index: number) => {
      return colorPalette[index % colorPalette.length] || generateRandomColor();
    };

    // Procesar resultados para el formato requerido
    const processedResults = results.map((row: any, index: number) => {
      // Asignar un color único para cada usuario
      const color = getUniqueColor(index);
      return {
        label: row.nombre_completo,
        data: row.ingresos.split(',').map(Number), // Convertir los ingresos a números
        backgroundColor: color,
        borderColor: color.replace('0.2', '1'), // Cambiar la opacidad del color de fondo para el borde
        borderWidth: 1,
        meses: row.meses
      };
    });

    return processedResults;
  } catch (err) {
    throw err;
  }
};


export const findRoutesByRoleService = async ({
    roleId
}: {
    roleId: string;
}) => {
    try {
      console.log(roleId,"-------------------------------------------");
      
        const query = `
      SELECT r.path, r.name
      FROM routes r
      INNER JOIN role_routes rr ON rr.routeId = r.id
      WHERE rr.roleId = :roleId
    `;

        const routes = await DataBase.instance.sequelize.query(query, {
            replacements: { roleId },
            type: QueryTypes.SELECT,
        });

        return routes;
    } catch (err) {
        throw err;
    }
};
