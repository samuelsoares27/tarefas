import Head from 'next/head'
import styles from '../../styles/home.module.css'
import Image from 'next/image'
import heroImg from '../../public/assets/hero.png'
import { GetStaticProps } from 'next'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConnection';

interface HomePros{
  posts: number,
  comments: number
}

export default function Home({posts, comments}: HomePros) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.LogoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar<br />
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comments</span>
          </section>
        </div>

      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const commentRef = collection(db, 'comments');
  const commentSnapshot = await getDocs(commentRef);

  const postRef = collection(db, 'tarefas');
  const postSnapshot = await getDocs(postRef);


  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 60 // 60 seconds
  }
}
