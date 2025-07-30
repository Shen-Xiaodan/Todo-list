import static spark.Spark.*; //Java HTTP 框架
import java.sql.*; //Java 数据库连接
import java.util.*; //Java 集合
import java.io.*; //文件操作
import com.google.gson.*; //把对象变成 JSON 发给前端，把前端传来的 JSON 转成 Java 对象操作

public class JavaTodoAPI {
    private static String DB_URL;
    private static String DB_USER;
    private static String DB_PASSWORD;
    private static int SERVER_PORT;
    private static final Gson gson = new Gson();

    // 静态初始化块，在类加载时读取配置文件
    static {
        loadConfiguration();
    }

    /**
     * 加载配置文件
     * 优先级：环境变量 > 配置文件 > 默认值
     */
    private static void loadConfiguration() {
        Properties props = new Properties();

        // 首先尝试从配置文件加载
        try (InputStream input = new FileInputStream("backend/config.properties")) {
            props.load(input);
            System.out.println("Configuration file loaded successfully");
        } catch (IOException e) {
            System.err.println("Warning: Could not load config.properties file: " + e.getMessage());
            System.err.println("Will use environment variables or default values");
        }

        // 从环境变量或配置文件获取值，环境变量优先
        DB_URL = getConfigValue("DB_URL", props.getProperty("db.url"),
                "jdbc:mysql://localhost:3306/TodoList?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC");
        DB_USER = getConfigValue("DB_USER", props.getProperty("db.username"), "root");
        DB_PASSWORD = getConfigValue("DB_PASSWORD", props.getProperty("db.password"), "password");

        String portStr = getConfigValue("SERVER_PORT", props.getProperty("server.port"), "8080");
        try {
            SERVER_PORT = Integer.parseInt(portStr);
        } catch (NumberFormatException e) {
            System.err.println("Invalid port number: " + portStr + ", using default 8080");
            SERVER_PORT = 8080;
        }

        // 验证必要的配置项
        if (DB_URL == null || DB_USER == null || DB_PASSWORD == null) {
            throw new RuntimeException("Database configuration is incomplete. Please check config.properties file or environment variables.");
        }

        System.out.println("Configuration loaded - Server will run on port: " + SERVER_PORT);
    }

    /**
     * 获取配置值，优先级：环境变量 > 配置文件 > 默认值
     */
    private static String getConfigValue(String envVar, String propValue, String defaultValue) {
        String envValue = System.getenv(envVar);
        if (envValue != null && !envValue.trim().isEmpty()) {
            return envValue;
        }
        if (propValue != null && !propValue.trim().isEmpty()) {
            return propValue;
        }
        return defaultValue;
    }

    public static void main(String[] args) {
        port(SERVER_PORT); //Java HTTP 服务运行端口

        // 启用CORS
        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        });

        // 处理 OPTIONS 请求
        options("/*", (request, response) -> {
            return "OK";
        });

        // API 路由
        path("/api/v1", () -> {
            // 获取所有 todos
            get("/todos", (req, res) -> {
                //路由定义，用法类似express
                res.type("application/json"); //设置返回类型
                try {
                    List<Todo> todos = getTodosFromDB();
                    return gson.toJson(todos);
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Failed to fetch todos", "message", e.getMessage()));
                }
            });

            // 创建新的 todo
            post("/todos", (req, res) -> {
                res.type("application/json");
                try {
                    Todo newTodo = gson.fromJson(req.body(), Todo.class);
                    Todo createdTodo = createTodo(newTodo);
                    res.status(201);
                    return gson.toJson(createdTodo);
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Failed to create todo", "message", e.getMessage()));
                }
            });

            // 更新 todo
            put("/todos/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params(":id"));
                    Todo updateData = gson.fromJson(req.body(), Todo.class);
                    Todo updatedTodo = updateTodo(id, updateData);
                    if (updatedTodo != null) {
                        return gson.toJson(updatedTodo);
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "Todo not found"));
                    }
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Failed to update todo", "message", e.getMessage()));
                }
            });

            // 删除 todo
            delete("/todos/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params(":id"));
                    boolean deleted = deleteTodo(id);
                    if (deleted) {
                        return gson.toJson(Map.of("success", true, "message", "Todo deleted successfully"));
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "Todo not found"));
                    }
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Failed to delete todo", "message", e.getMessage()));
                }
            });
        });

        System.out.println("Java Todo API Server started on port 8080");
        System.out.println("API endpoints available at: http://localhost:8080/api/v1/todos");
    }

    // Todo 数据类
    public static class Todo {
        private int id;
        private String text;
        private boolean done;

        public Todo() {}

        public Todo(int id, String text, boolean done) {
            this.id = id;
            this.text = text;
            this.done = done;
        }

        // Getters and setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public boolean isDone() { return done; }
        public void setDone(boolean done) { this.done = done; }
    }

    // 获取所有 todos
    public static List<Todo> getTodosFromDB() throws SQLException {
        List<Todo> todos = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT id, content as text, done FROM todos ORDER BY id DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Todo todo = new Todo(
                    rs.getInt("id"),
                    rs.getString("text"),
                    rs.getBoolean("done")
                );
                todos.add(todo);
            }
        }

        return todos;
    }

    // 创建新的 todo
    public static Todo createTodo(Todo newTodo) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "INSERT INTO todos (content, done) VALUES (?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);

            stmt.setString(1, newTodo.getText());
            stmt.setBoolean(2, newTodo.isDone());

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating todo failed, no rows affected.");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int id = generatedKeys.getInt(1);
                    return getTodoById(id);
                } else {
                    throw new SQLException("Creating todo failed, no ID obtained.");
                }
            }
        }
    }

    // 更新 todo
    public static Todo updateTodo(int id, Todo updateData) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            StringBuilder sql = new StringBuilder("UPDATE todos SET");
            List<Object> params = new ArrayList<>();
            boolean first = true;

            if (updateData.getText() != null) {
                if (!first) sql.append(",");
                sql.append(" content = ?");
                params.add(updateData.getText());
                first = false;
            }

            // 注意：done 字段可能为 false，所以不能简单判断 null
            if (!first) sql.append(",");
            sql.append(" done = ?");
            params.add(updateData.isDone());

            sql.append(" WHERE id = ?");
            params.add(id);

            PreparedStatement stmt = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                return getTodoById(id);
            } else {
                return null; // Todo not found
            }
        }
    }

    // 删除 todo
    public static boolean deleteTodo(int id) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "DELETE FROM todos WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);

            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    // 根据 ID 获取单个 todo
    private static Todo getTodoById(int id) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT id, content as text, done FROM todos WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return new Todo(
                    rs.getInt("id"),
                    rs.getString("text"),
                    rs.getBoolean("done")
                );
            }
            return null;
        }
    }
}