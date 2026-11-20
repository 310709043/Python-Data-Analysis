-- 由 scripts/dump_schema.py 產生，請勿手動修改

CREATE TABLE otp_codes (
	id SERIAL NOT NULL, 
	phone_hash VARCHAR(64) NOT NULL, 
	code_hash VARCHAR(64) NOT NULL, 
	attempts INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	used_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE INDEX ix_otp_codes_phone_hash ON otp_codes (phone_hash);

CREATE TABLE users (
	id SERIAL NOT NULL, 
	nickname VARCHAR(32) NOT NULL, 
	phone_hash VARCHAR(64), 
	age_verified BOOLEAN NOT NULL, 
	show_on_leaderboard BOOLEAN NOT NULL, 
	consent_version VARCHAR(32), 
	consent_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (nickname), 
	UNIQUE (phone_hash)
);


CREATE TABLE auth_sessions (
	token_hash VARCHAR(64) NOT NULL, 
	user_id INTEGER NOT NULL, 
	device_hash VARCHAR(64), 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (token_hash), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_auth_sessions_device_hash ON auth_sessions (device_hash);
CREATE INDEX ix_auth_sessions_user_id ON auth_sessions (user_id);

CREATE TABLE encounters (
	id SERIAL NOT NULL, 
	initiator_id INTEGER, 
	partner_id INTEGER, 
	occurred_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	status VARCHAR(16) NOT NULL, 
	review_status VARCHAR(16) NOT NULL, 
	flag_reasons VARCHAR(255), 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	responded_at TIMESTAMP WITHOUT TIME ZONE, 
	initiator_device_hash VARCHAR(64), 
	partner_device_hash VARCHAR(64), 
	PRIMARY KEY (id), 
	FOREIGN KEY(initiator_id) REFERENCES users (id) ON DELETE SET NULL, 
	FOREIGN KEY(partner_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_enc_initiator_time ON encounters (initiator_id, occurred_at);
CREATE INDEX ix_enc_partner_time ON encounters (partner_id, occurred_at);
CREATE INDEX ix_enc_review ON encounters (review_status);
CREATE INDEX ix_enc_status_expires ON encounters (status, expires_at);

CREATE TABLE partner_links (
	id SERIAL NOT NULL, 
	user_low_id INTEGER NOT NULL, 
	user_high_id INTEGER NOT NULL, 
	requested_by INTEGER NOT NULL, 
	status VARCHAR(16) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	responded_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_partner_pair UNIQUE (user_low_id, user_high_id), 
	CONSTRAINT ck_partner_order CHECK (user_low_id < user_high_id), 
	FOREIGN KEY(user_low_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(user_high_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(requested_by) REFERENCES users (id) ON DELETE CASCADE
);


