from __future__ import annotations
import sys
import psycopg2
from psycopg2 import extras
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, 
    QHBoxLayout, QLabel, QLineEdit, QPushButton, 
    QTableWidget, QTableWidgetItem, QMessageBox, QComboBox, 
    QStackedWidget, QHeaderView
)
from PyQt6.QtCore import Qt

# --- DATABASE CONFIGURATION ---
DB_PARAMS = {
    "host": "localhost",
    "database": "university_db",      # Your database name from previous steps
    "user": "vjti",         # Your username
    "password": "vjti@123", # Replace with your actual password
    "port": "5432"
}

class DatabaseManager:
    """Handles all PostgreSQL interactions."""
    def __init__(self):
        self.conn = None
        try:
            self.conn = psycopg2.connect(**DB_PARAMS)
        except Exception as e:
            print(f"Database connection failed: {e}")

    def get_user(self, username: str, password_hash: str) -> tuple | None:
        """Verify login credentials."""
        query = """
            SELECT u.user_id, r.role_name 
            FROM Users u
            JOIN Roles r ON u.role_id = r.role_id
            WHERE u.username = %s AND u.password_hash = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (username, password_hash))
            return cur.fetchone()

    def get_table_data(self, query: str, params: tuple = None) -> tuple[list, list]:
        """Generic fetcher returning (column_names, rows)."""
        with self.conn.cursor() as cur:
            cur.execute(query, params)
            col_names = [desc[0] for desc in cur.description]
            return col_names, cur.fetchall()

    def run_command(self, query: str, params: tuple = None) -> bool:
        """Executes INSERT, UPDATE, or DELETE."""
        try:
            with self.conn.cursor() as cur:
                cur.execute(query, params)
                self.conn.commit()
                return True
        except Exception as e:
            self.conn.rollback()
            print(f"Query Error: {e}")
            return False

# --- GUI WINDOWS ---

class LoginWindow(QWidget):
    def __init__(self, db: DatabaseManager, on_login_success):
        super().__init__()
        self.db = db
        self.on_login_success = on_login_success
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("University Portal Login")
        self.setFixedSize(350, 250)
        layout = QVBoxLayout()
        layout.setContentsMargins(40, 40, 40, 40)

        layout.addWidget(QLabel("<b>Username</b>"))
        self.user_input = QLineEdit()
        self.user_input.setPlaceholderText("e.g., admin or prof_turing")
        layout.addWidget(self.user_input)

        layout.addWidget(QLabel("<b>Password</b>"))
        self.pass_input = QLineEdit()
        self.pass_input.setEchoMode(QLineEdit.EchoMode.Password)
        layout.addWidget(self.pass_input)

        login_btn = QPushButton("Login")
        login_btn.setStyleSheet("background-color: #2c3e50; color: white; padding: 8px;")
        login_btn.clicked.connect(self.handle_login)
        layout.addWidget(login_btn)

        self.setLayout(layout)

    def handle_login(self):
        user, pwd = self.user_input.text(), self.pass_input.text()
        result = self.db.get_user(user, pwd)
        if result:
            self.on_login_success(result[0], result[1])
        else:
            QMessageBox.critical(self, "Error", "Invalid username or password.")

class Dashboard(QMainWindow):
    def __init__(self, db: DatabaseManager, user_id: int, role: str, on_logout):
        super().__init__()
        self.db, self.user_id, self.role = db, user_id, role
        self.on_logout = on_logout
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle(f"University Management - {self.role} Panel")
        self.resize(1000, 700)

        # Central Widget
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        self.layout = QVBoxLayout(main_widget)

        # Header bar
        header = QHBoxLayout()
        header.addWidget(QLabel(f"Welcome, ID: {self.user_id} | Role: <b>{self.role}</b>"))
        logout_btn = QPushButton("Sign Out")
        logout_btn.clicked.connect(self.on_logout)
        header.addStretch()
        header.addWidget(logout_btn)
        self.layout.addLayout(header)

        # Data Table
        self.table = QTableWidget()
        self.table.setAlternatingRowColors(True)
        self.layout.addWidget(self.table)

        # Control Panel (Changes based on Role)
        self.controls = QHBoxLayout()
        self.layout.addLayout(self.controls)
        self.setup_role_features()

    def display_query(self, query: str, params: tuple = None):
        """Loads query results into the table."""
        try:
            cols, rows = self.db.get_table_data(query, params)
            self.table.setColumnCount(len(cols))
            self.table.setRowCount(len(rows))
            self.table.setHorizontalHeaderLabels(cols)
            self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)

            for i, row in enumerate(rows):
                for j, val in enumerate(row):
                    self.table.setItem(i, j, QTableWidgetItem(str(val)))
        except Exception as e:
            QMessageBox.warning(self, "Data Error", f"Could not load data: {e}")

    def setup_role_features(self):
        """Main Logic: Defines what each user can do."""
        
        if self.role == 'Admin':
            # Feature 1: View any table
            self.selector = QComboBox()
            self.selector.addItems(["Users", "Departments", "Professors", "Students", "Courses", "Enrollments"])
            self.controls.addWidget(QLabel("Select Table:"))
            self.controls.addWidget(self.selector)
            
            view_btn = QPushButton("View Table")
            view_btn.clicked.connect(lambda: self.display_query(f"SELECT * FROM {self.selector.currentText()}"))
            self.controls.addWidget(view_btn)

            # Feature 2: Data Operation (Delete User)
            del_btn = QPushButton("Delete Selected User")
            del_btn.setStyleSheet("background-color: #c0392b; color: white;")
            del_btn.clicked.connect(self.admin_delete_user)
            self.controls.addWidget(del_btn)

        elif self.role == 'Professor':
            # Feature 1: View Students
            self.display_query("""
                SELECT s.student_id, s.first_name, s.last_name, c.course_name, e.grade, e.enrollment_id
                FROM Professors p
                JOIN Courses c ON p.prof_id = c.prof_id
                JOIN Enrollments e ON c.course_id = e.course_id
                JOIN Students s ON e.student_id = s.student_id
                WHERE p.user_id = %s
            """, (self.user_id,))

            # Feature 2: Data Operation (Update Grade)
            self.grade_input = QLineEdit()
            self.grade_input.setPlaceholderText("New Grade (e.g. A+)")
            self.controls.addWidget(QLabel("Update Grade:"))
            self.controls.addWidget(self.grade_input)
            
            upd_btn = QPushButton("Apply to Selected Row")
            upd_btn.clicked.connect(self.professor_update_grade)
            self.controls.addWidget(upd_btn)

        elif self.role == 'Student':
            # View only: No data operations for students
            self.display_query("""
                SELECT c.course_name, c.credits, e.grade, p.last_name as Prof
                FROM Students s
                JOIN Enrollments e ON s.student_id = e.student_id
                JOIN Courses c ON e.course_id = c.course_id
                LEFT JOIN Professors p ON c.prof_id = p.prof_id
                WHERE s.user_id = %s
            """, (self.user_id,))
            self.controls.addWidget(QLabel("<i>Note: Student accounts are read-only.</i>"))

    # --- ACTION HANDLERS ---

    def admin_delete_user(self):
        """Demonstrates Foreign Key ON DELETE CASCADE."""
        curr_row = self.table.currentRow()
        if curr_row < 0 or self.selector.currentText() != "Users":
            QMessageBox.information(self, "Info", "Select a row in the 'Users' table to delete.")
            return
        
        user_id = self.table.item(curr_row, 0).text()
        confirm = QMessageBox.question(self, "Confirm", f"Delete User {user_id}? This will remove their Prof/Student profile too.")
        if confirm == QMessageBox.StandardButton.Yes:
            if self.db.run_command("DELETE FROM Users WHERE user_id = %s", (user_id,)):
                self.display_query("SELECT * FROM Users")

    def professor_update_grade(self):
        """Demonstrates Data Operation: UPDATE."""
        curr_row = self.table.currentRow()
        new_grade = self.grade_input.text()
        if curr_row < 0 or not new_grade:
            QMessageBox.warning(self, "Error", "Select a student and enter a grade.")
            return

        enrollment_id = self.table.item(curr_row, 5).text()
        if self.db.run_command("UPDATE Enrollments SET grade = %s WHERE enrollment_id = %s", (new_grade, enrollment_id)):
            QMessageBox.information(self, "Success", "Grade updated.")
            # Refresh
            self.setup_role_features() 

class AppController(QStackedWidget):
    """Controls the switching between Login and Dashboard."""
    def __init__(self):
        super().__init__()
        self.db = DatabaseManager()
        self.show_login()

    def show_login(self):
        self.login = LoginWindow(self.db, self.show_dashboard)
        self.addWidget(self.login)
        self.setCurrentWidget(self.login)

    def show_dashboard(self, user_id, role):
        self.dash = Dashboard(self.db, user_id, role, self.logout)
        self.addWidget(self.dash)
        self.setCurrentWidget(self.dash)

    def logout(self):
        self.show_login()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion") # Cleaner look on all OS
    ctrl = AppController()
    ctrl.show()
    sys.exit(app.exec())