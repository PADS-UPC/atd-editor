(ns backend.queries
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.java.io :as io])
  (:import [java.security MessageDigest]
           [java.util Base64]))

(def mysql-db
  (delay
   {:dbtype "mysql"
    :dbname "bpmnlp"
    :host "mysql-rdlab.cs.upc.edu"
    :port "3306"
    :serverTimezone "UTC"
    :user "bpmnlp"
    :password (slurp (io/file (System/getProperty "user.home")
                              "BPMN" "config" "database-pw"))}))

(defn encode-password [password]
  (let [md (MessageDigest/getInstance "SHA-512")
        enc (java.util.Base64/getEncoder)]
    (.update md (.getBytes password))
    (.encodeToString enc (.digest md))))

(defn validate-user [{:keys [username password] :as req}]
  (println req)
  {:identity username
   :data username}
  #_(let [user (first
              (jdbc/query @mysql-db
                          ["SELECT * FROM `user` WHERE username=?" username]))]
    (when (and user
               (= (encode-password password)
                  (clojure.string/replace (:password user) #"\n" "")))

      {:identity username
       :data username})))
