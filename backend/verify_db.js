import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyDatabaseStructure() {
  try {
    // 1. Get all table names in public schema
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `;
    console.log("=== TABLES ===");
    console.log(tables.map(t => t.tablename));

    // 2. Check for expected tables based on requirements
    const expectedTables = [
      'users', 'complaints', 'comments', 'notifications', 
      'password_reset_otps', 'complaint_histories', '_prisma_migrations'
    ];
    
    console.log("\n=== MISSING TABLES ===");
    const existingTableNames = tables.map(t => t.tablename);
    const missing = expectedTables.filter(t => !existingTableNames.includes(t));
    if (missing.length === 0) {
      console.log("None. All expected tables are present.");
    } else {
      console.log(missing);
    }

    // 3. Get all foreign key relations
    const relations = await prisma.$queryRaw`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
    `;
    
    console.log("\n=== FOREIGN KEY RELATIONS ===");
    relations.forEach(r => {
      console.log(`[${r.table_name}] ${r.column_name} -> [${r.foreign_table_name}] ${r.foreign_column_name} (ON DELETE ${r.delete_rule})`);
    });

  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseStructure();
