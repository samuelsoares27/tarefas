import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import {
    ChangeEvent, FormEvent,
    useState, useEffect
} from 'react';
import Head from 'next/head';
import styles from './styles.module.css';
import TextArea from '@/src/components/header/textArea';
import { db } from '../../services/firebaseConnection';
import {
    addDoc, collection,
    query, orderBy,
    where, onSnapshot,
    doc, deleteDoc
} from 'firebase/firestore';
import Link from 'next/link';

interface HomeProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: string,
    created: Date,
    public: boolean,
    tarefa: string,
    user: string
}

export default function Dashboard({ user }: HomeProps) {

    const [input, setInput] = useState("");
    const [publica, setPublica] = useState(false);
    const [task, setTask] = useState<TaskProps[]>([]);

    useEffect(() => {

        async function loadTarefas() {

            const tarefasRef = collection(db, "tarefas");
            const q = query(
                tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            );

            onSnapshot(q, (snapshot) => {

                let lista = [] as TaskProps[];

                snapshot.forEach((doc) => {

                    lista.push({
                        id: doc.id,
                        created: doc.data().created,
                        public: doc.data().publica,
                        tarefa: doc.data().tarefa,
                        user: doc.data().user,
                    });
                })

                console.log(lista)
                setTask(lista);
            });
        }

        loadTarefas();
    }, [user?.email])


    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        setPublica(e.target.checked);
    }

    async function handleRegisterTask(e: FormEvent) {
        e.preventDefault();

        if (!input) return;

        try {

            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user.email,
                publica: publica
            });

            setInput("");
            setPublica(false);

        } catch (erro) {
            console.log(erro)
        }
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        )

    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tarefas", id);
        await deleteDoc(docRef);
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Dashboard</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>
                        <form onSubmit={handleRegisterTask}>
                            <TextArea
                                placeholder='Digite qual sua tarefa'
                                value={input}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publica}
                                    onChange={e => handleChangePublic(e)}
                                />
                                <label>Deixar tarefa pública</label>
                            </div>
                            <button className={styles.button} type='submit'>
                                cadastrar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas Tarefas</h1>
                    {

                        task.map((item) => (
                            <article key={item.id} className={styles.task}>
                                {
                                    item.public && (
                                        <div className={styles.tagContainer}>
                                            <label className={styles.tag}>PUBLICO</label>
                                            <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                                                <FiShare2
                                                    size={22}
                                                    color="#3182ff"
                                                />
                                            </button>
                                        </div>
                                    )
                                }

                                <div className={styles.taskContent}>

                                    {
                                        item.public ? (
                                            <Link href={`/task/${item.id}`}>
                                                <p>{item.tarefa}</p>
                                            </Link>
                                        ) :
                                            <p>{item.tarefa}</p>
                                    }

                                    <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                        <FaTrash
                                            size={24}
                                            color="#ea3140"
                                        />
                                    </button>
                                </div>
                            </article>
                        ))

                    }
                </section>
            </main>
        </div >
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

    const session = await getSession({ req });

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    return {
        props: {
            user: {
                email: session?.user?.email
            }
        },
    }
}