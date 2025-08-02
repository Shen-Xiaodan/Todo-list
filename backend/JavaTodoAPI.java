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
            // 用户注册
            post("/signup", (req, res) -> {
                res.type("application/json");
                try {
                    User newUser = gson.fromJson(req.body(), User.class);
                    User createdUser = signupUser(newUser);
                    res.status(201);
                    return gson.toJson(Map.of("success", true, "message", "User created successfully", "user", createdUser));
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Failed to signup user", "message", e.getMessage()));
                }
            });
            
            // 用户登录
            post("/login", (req, res) -> {
                res.type("application/json");
                try {
                    User loginUser = gson.fromJson(req.body(), User.class);
                    User loggedInUser = loginUser(loginUser);
                    if (loggedInUser != null) {
                        return gson.toJson(Map.of("success", true, "message", "Login successful", "user", loggedInUser));
                    } else {
                        res.status(401);
                        return gson.toJson(Map.of("error", "Invalid username or password"));
                    }
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Failed to login user", "message", e.getMessage()));
                }
            });

            // 获取所有 todos (需要用户ID参数)
            get("/todos", (req, res) -> {
                //路由定义，用法类似express
                res.type("application/json"); //设置返回类型
                try {
                    String userIdParam = req.queryParams("userId");
                    if (userIdParam == null || userIdParam.trim().isEmpty()) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "userId parameter is required"));
                    }

                    int userId = Integer.parseInt(userIdParam);
                    List<Todo> todos = getTodosFromDB(userId);
                    return gson.toJson(todos);
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "Invalid userId parameter"));
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
                    if (newTodo.getUserId() == null) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "userId is required"));
                    }
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

                    // 验证用户ID
                    if (updateData.getUserId() == null) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "userId is required"));
                    }

                    Todo updatedTodo = updateTodo(id, updateData);
                    if (updatedTodo != null) {
                        return gson.toJson(updatedTodo);
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "Todo not found or access denied"));
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
                    String userIdParam = req.queryParams("userId");

                    if (userIdParam == null || userIdParam.trim().isEmpty()) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "userId parameter is required"));
                    }

                    int userId = Integer.parseInt(userIdParam);
                    boolean deleted = deleteTodo(id, userId);
                    if (deleted) {
                        return gson.toJson(Map.of("success", true, "message", "Todo deleted successfully"));
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "Todo not found or access denied"));
                    }
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "Invalid userId parameter"));
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Failed to delete todo", "message", e.getMessage()));
                }
            });
        });

        System.out.println("Java Todo API Server started on port " + SERVER_PORT);
        System.out.println("API endpoints available at: http://localhost:" + SERVER_PORT + "/api/v1/");
    }

    // user
    public static class User {
        private Integer id;
        private String username;
        private String password;

        public User() {}

        public User(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public User(Integer id, String username, String password) {
            this.id = id;
            this.username = username;
            this.password = password;
        }

        // Getters and setters
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    // 用户注册
    public static User signupUser(User newUser) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "INSERT INTO users (username, password) VALUES (?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);

            stmt.setString(1, newUser.getUsername());
            stmt.setString(2, newUser.getPassword());

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating user failed, no rows affected.");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int id = generatedKeys.getInt(1);
                    return getUserById(id);
                } else {
                    throw new SQLException("Creating user failed, no ID obtained.");
                }
            }
        }
    }
    
    // 用户登录
    public static User loginUser(User loginUser) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT id, username, password FROM users WHERE username = ? AND password = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, loginUser.getUsername());
            stmt.setString(2, loginUser.getPassword());
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return new User(
                    rs.getInt("id"),
                    rs.getString("username"),
                    rs.getString("password")
                );
            }
            return null;
        }
    }
    
    // 根据用户ID获取用户
    private static User getUserById(int id) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT id, username, password FROM users WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return new User(
                    rs.getInt("id"),
                    rs.getString("username"),
                    rs.getString("password")
                );
            }
            return null;
        }
    }

    // Todo 数据类
    public static class Todo {
        private int id;
        private String text;
        private boolean done;
        private Integer userId;

        public Todo() {}

        public Todo(int id, String text, Integer userId, boolean done) {
            this.id = id;
            this.text = text;
            this.done = done;
            this.userId = userId;
        }

        // Getters and setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public boolean isDone() { return done; }
        public void setDone(boolean done) { this.done = done; }
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
    }

    // 获取指定用户的所有 todos
    public static List<Todo> getTodosFromDB(int userId) throws SQLException {
        List<Todo> todos = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT id, content as text, done, user_id FROM todos WHERE user_id = ? ORDER BY id DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Todo todo = new Todo(
                    rs.getInt("id"),
                    rs.getString("text"),
                    rs.getInt("user_id"),
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
            String sql = "INSERT INTO todos (content, done, user_id) VALUES (?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);

            stmt.setString(1, newTodo.getText());
            stmt.setBoolean(2, newTodo.isDone());
            stmt.setInt(3, newTodo.getUserId());

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

    // 更新 todo (只允许用户更新自己的todo)
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

            sql.append(" WHERE id = ? AND user_id = ?");
            params.add(id);
            params.add(updateData.getUserId());

            PreparedStatement stmt = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                return getTodoById(id);
            } else {
                return null; // Todo not found or access denied
            }
        }
    }

    // 删除 todo (只允许用户删除自己的todo)
    public static boolean deleteTodo(int id, int userId) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "DELETE FROM todos WHERE id = ? AND user_id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            stmt.setInt(2, userId);

            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    // 根据 ID 获取单个 todo
    private static Todo getTodoById(int id) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT id, content as text, done, user_id FROM todos WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return new Todo(
                    rs.getInt("id"),
                    rs.getString("text"),
                    rs.getInt("user_id"),
                    rs.getBoolean("done")
                );
            }
            return null;
        }
    }
}